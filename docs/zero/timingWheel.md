# 时间轮TimingWheel实现

本文来介绍 `go-zero` 中 **延迟操作**，它可能让开发者调度多个任务时，**只需关注具体的业务执行函数和执行时间「立即或者延迟」**。而 **延迟操作**，通常可以采用两个方案：

1. `Timer`：定时器维护一个优先队列，到时间点执行，然后把需要执行的 task 存储在 map 中
2. `collection` 中的 `timingWheel` ，维护一个存放任务组的数组，每一个槽都维护一个存储task的双向链表。开始执行时，计时器每隔指定时间执行一个槽里面的tasks。

方案2把维护task从 `优先队列 O(nlog(n))` 降到 `双向链表 O(1)`，而执行task也只要轮询一个时间点的tasks `O(N)`，不需要像优先队列，放入和删除元素 `O(nlog(n))`。

我们先看看 `go-zero` 中自己对 `timingWheel` 的使用 ：

## cache 中的 timingWheel

首先我们先来在 `collection` 的 `cache` 中关于 `timingWheel` 的使用：

```go
timingWheel, err := NewTimingWheel(time.Second, slots, func(k, v interface{}) {
  key, ok := k.(string)
  if !ok {
    return
  }
  cache.Del(key)
})
if err != nil {
  return nil, err
}

cache.timingWheel = timingWheel
```

这是 `cache` 初始化中也同时初始化 `timingWheel` 做key的过期处理，参数依次代表：

- `interval`：时间划分刻度
- `numSlots`：时间槽
- `execute`：时间点执行函数

在 `cache` 中执行函数则是 **删除过期key**，而这个过期则由 `timingWheel` 来控制推进时间。

**接下来，就通过 `cache` 对 `timingWheel` 的使用来认识。**

### 初始化

```go
// 真正做初始化
func newTimingWheelWithClock(interval time.Duration, numSlots int, execute Execute, ticker timex.Ticker) (
	*TimingWheel, error) {
	tw := &TimingWheel{
		interval:      interval,                     // 单个时间格时间间隔
		ticker:        ticker,                       // 定时器，做时间推动，以interval为单位推进
		slots:         make([]*list.List, numSlots), // 时间轮
		timers:        NewSafeMap(),                 // 存储task{key, value}的map [执行execute所需要的参数]
		tickedPos:     numSlots - 1,                 // at previous virtual circle
		execute:       execute,                      // 执行函数
		numSlots:      numSlots,                     // 初始化 slots num
		setChannel:    make(chan timingEntry),       // 以下几个channel是做task传递的
		moveChannel:   make(chan baseEntry),
		removeChannel: make(chan interface{}),
		drainChannel:  make(chan func(key, value interface{})),
		stopChannel:   make(chan lang.PlaceholderType),
	}
	// 把 slot 中存储的 list 全部准备好
	tw.initSlots()
	// 开启异步协程，使用 channel 来做task通信和传递
	go tw.run()

	return tw, nil
}
```

![](https://static.gocn.vip/photo/2020/3a681886-528c-4eae-b309-15f5450b1f88.png?x-oss-process=image/resize,w_1920)

以上比较直观展示 `timingWheel` 的 **“时间轮”**，后面会围绕这张图解释其中推进的细节。

 `go tw.run()` 开一个协程做时间推动：

```go
func (tw *TimingWheel) run() {
	for {
		select {
      // 定时器做时间推动 -> scanAndRunTasks()
		case <-tw.ticker.Chan():
			tw.onTick()
      // add task 会往 setChannel 输入task
		case task := <-tw.setChannel:
			tw.setTask(&task)
		...
		}
	}
}
```

可以看出，在初始化的时候就开始了 `timer` 执行，并以`internal`时间段转动，然后底层不停的获取来自 `slot` 中的  `list` 的task，交给 `execute` 执行。

![](https://static.gocn.vip/photo/2020/47ea163e-089f-48c7-ba32-1401c67cf152.png?x-oss-process=image/resize,w_1920)

### Task Operation

紧接着就是设置 `cache key` ：

```go
func (c *Cache) Set(key string, value interface{}) {
	c.lock.Lock()
	_, ok := c.data[key]
	c.data[key] = value
	c.lruCache.add(key)
	c.lock.Unlock()

	expiry := c.unstableExpiry.AroundDuration(c.expire)
	if ok {
		c.timingWheel.MoveTimer(key, expiry)
	} else {
		c.timingWheel.SetTimer(key, value, expiry)
	}
}
```

1. 先看在 `data map` 中有没有存在这个key
2. 存在，则更新 `expire`   -> `MoveTimer()`
3. 第一次设置key   ->   `SetTimer()`

所以对于 `timingWheel` 的使用上就清晰了，开发者根据需求可以 `add` 或是 `update`。

同时我们跟源码进去会发现：`SetTimer() MoveTimer()` 都是将task输送到channel，由 `run()` 中开启的协程不断取出 `channel` 的task操作。

> `SetTimer() -> setTask()`：
>
> - not exist task：`getPostion -> pushBack to list -> setPosition`
> - exist task：`get from timers -> moveTask() `
>
> `MoveTimer() -> moveTask()`

由上面的调用链，有一个都会调用的函数：`moveTask()`

```go
func (tw *TimingWheel) moveTask(task baseEntry) {
	// timers: Map => 通过key获取 [positionEntry「pos, task」]
	val, ok := tw.timers.Get(task.key)
	if !ok {
		return
	}

	timer := val.(*positionEntry)
  	// {delay < interval} => 延迟时间比一个时间格间隔还小，没有更小的刻度，说明任务应该立即执行
	if task.delay < tw.interval {
		threading.GoSafe(func() {
			tw.execute(timer.item.key, timer.item.value)
		})
		return
	}
	// 如果 > interval，则通过 延迟时间delay 计算其出时间轮中的 new pos, circle
	pos, circle := tw.getPositionAndCircle(task.delay)
	if pos >= timer.pos {
		timer.item.circle = circle
                // 记录前后的移动offset。为了后面过程重新入队
		timer.item.diff = pos - timer.pos
	} else if circle > 0 {
		// 转移到下一层，将 circle 转换为 diff 一部分
		circle--
		timer.item.circle = circle
		// 因为是一个数组，要加上 numSlots [也就是相当于要走到下一层]
		timer.item.diff = tw.numSlots + pos - timer.pos
	} else {
		// 如果 offset 提前了，此时 task 也还在第一层
		// 标记删除老的 task，并重新入队，等待被执行
		timer.item.removed = true
		newItem := &timingEntry{
			baseEntry: task,
			value:     timer.item.value,
		}
		tw.slots[pos].PushBack(newItem)
		tw.setTimerPosition(pos, newItem)
	}
}
```

以上过程有以下几种情况：

- `delay < internal`：因为 < 单个时间精度，表示这个任务已经过期，需要马上执行
- 针对改变的 `delay`：
  - `new >= old`：`<newPos, newCircle, diff>`
  - `newCircle > 0`：计算diff，并将 circle 转换为 下一层，故diff + numslots
  - 如果只是单纯延迟时间缩短，则将老的task标记删除，重新加入list，等待下一轮loop被execute

### Execute

之前在初始化中，`run()` 中定时器的不断推进，推进的过程主要就是把 list中的 task 传给执行的 `execute func`。我们从定时器的执行开始看：

```go
// 定时器 「每隔 internal 会执行一次」
func (tw *TimingWheel) onTick() {
        // 每次执行更新一下当前执行 tick 位置
	tw.tickedPos = (tw.tickedPos + 1) % tw.numSlots
        // 获取此时 tick位置 中的存储task的双向链表
	l := tw.slots[tw.tickedPos]
	tw.scanAndRunTasks(l)
}
```

紧接着是如何去执行 `execute`：

```go
func (tw *TimingWheel) scanAndRunTasks(l *list.List) {
	// 存储目前需要执行的task{key, value}  [execute所需要的参数，依次传递给execute执行]
	var tasks []timingTask

	for e := l.Front(); e != nil; {
		task := e.Value.(*timingEntry)
                // 标记删除，在 scan 中做真正的删除 「删除map的data」
		if task.removed {
			next := e.Next()
			l.Remove(e)
			tw.timers.Del(task.key)
			e = next
			continue
		} else if task.circle > 0 {
			// 当前执行点已经过期，但是同时不在第一层，所以当前层即然已经完成了，就会降到下一层
                        // 但是并没有修改 pos
			task.circle--
			e = e.Next()
			continue
		} else if task.diff > 0 {
			// 因为之前已经标注了diff，需要再进入队列
			next := e.Next()
			l.Remove(e)
			pos := (tw.tickedPos + task.diff) % tw.numSlots
			tw.slots[pos].PushBack(task)
			tw.setTimerPosition(pos, task)
			task.diff = 0
			e = next
			continue
		}
		// 以上的情况都是不能执行的情况，能够执行的会被加入tasks中
		tasks = append(tasks, timingTask{
			key:   task.key,
			value: task.value,
		})
		next := e.Next()
		l.Remove(e)
		tw.timers.Del(task.key)
		e = next
	}
	// for range tasks，然后把每个 task->execute 执行即可
	tw.runTasks(tasks)
}
```

具体的分支情况在注释中说明了，在看的时候可以和前面的 `moveTask()` 结合起来，其中 `circle` 下降，`diff` 的计算是关联两个函数的重点。

至于 `diff` 计算就涉及到 `pos, circle` 的计算：

```go
// interval: 4min, d: 60min, numSlots: 16, tickedPos = 15
// step = 15, pos = 14, circle = 0
func (tw *TimingWheel) getPositionAndCircle(d time.Duration) (pos int, circle int) {
	steps := int(d / tw.interval)
	pos = (tw.tickedPos + steps) % tw.numSlots
	circle = (steps - 1) / tw.numSlots
	return
}
```

> 上面的过程可以简化成下面：
>
> ```go
> steps = d / interval
> pos = step % numSlots - 1
> circle = (step - 1) / numSlots
> ```

## 总结

1. `timingWheel` 靠定时器推动，时间前进的同时会取出**当前时间格**中 `list`「双向链表」的task，传递到 `execute` 中执行。因为是是靠 `internal` 固定时间刻度推进，可能就会出现：一个 60s 的task，`internal = 1s`，这样就会空跑59次loop。

2. 而在扩展时间上，采取 `circle` 分层，这样就可以不断复用原有的 `numSlots` ，因为定时器在不断 `loop`，而执行可以把上层的 `slot` 下降到下层，在不断 `loop` 中就可以执行到上层的task。这样的设计可以在不创造额外的数据结构，突破长时间的限制。


## 参考资料

- [go-zero](https://github.com/tal-tech/go-zero)
- [go-zero 文档](https://www.yuque.com/tal-tech/go-zero)
- [go-zero中 collection.Cache](https://github.com/zeromicro/zero-doc/blob/main/doc/collection.md)

<Vssue title="timingWheel" />

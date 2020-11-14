# 2.3 executors

在 `go-zero` 中，`executors` 充当任务池，做多任务缓冲，使用做批量处理的任务。如：`clickhouse` 大批量 `insert`，`sql batch insert`。同时也可以在 `go-queue` 也可以看到 `executors` 【在 `queue` 里面使用的是 `ChunkExecutor` ，限定任务提交字节大小】。


所以当你存在以下需求，都可以使用这个组件：


- 批量提交任务
- 缓冲一部分任务，惰性提交
- 延迟任务提交



具体解释之前，先给一个大致的概览图：
![c42c34e8d33d48ec8a63e56feeae882a.png](https://cdn.nlark.com/yuque/0/2020/png/2623842/1601723457107-a4b762da-d737-456e-944c-374e4440dc3d.png#align=left&display=inline&height=1011&margin=%5Bobject%20Object%5D&name=c42c34e8d33d48ec8a63e56feeae882a.png&originHeight=1011&originWidth=1544&size=151855&status=done&style=none&width=1544)
## 接口设计


在 `executors` 包下，有如下几个 `executor` ：

| Name | Margin value |
| --- | --- |
| `bulkexecutor` | 达到 `maxTasks` 【最大任务数】 提交 |
| `chunkexecutor` | 达到 `maxChunkSize`【最大字节数】提交 |
| `periodicalexecutor` | `basic executor` |
| `delayexecutor` | 延迟执行传入的 `fn()` |
| `lessexecutor` |  |



你会看到除了有特殊功能的的 `delay`，`less` ，其余3个都是 `executor` + `container` 的组合设计：


```go
func NewBulkExecutor(execute Execute, opts ...BulkOption) *BulkExecutor {
    // 选项模式：在 go-zero 中多处出现。在多配置下，比较好的设计思路
    // https://halls-of-valhalla.org/beta/articles/functional-options-pattern-in-go,54/
	options := newBulkOptions()
	for _, opt := range opts {
		opt(&options)
	}
    // 1. task container: [execute 真正做执行的函数] [maxTasks 执行临界点]
	container := &bulkContainer{
		execute:  execute,
		maxTasks: options.cachedTasks,
	}
    // 2. 可以看出 bulkexecutor 底层依赖 periodicalexecutor
	executor := &BulkExecutor{
		executor:  NewPeriodicalExecutor(options.flushInterval, container),
		container: container,
	}

	return executor
}
```


而这个 `container`是个 `interface`：


```go
TaskContainer interface {
    // 把 task 加入 container
    AddTask(task interface{}) bool
    // 实际上是去执行传入的 execute func()
	Execute(tasks interface{})
	// 达到临界值，移除 container 中全部的 task，通过 channel 传递到 execute func() 执行
	RemoveAll() interface{}
}
```


由此可见之间的依赖关系：


- `bulkexecutor`：`periodicalexecutor` + `bulkContainer`
- `chunkexecutor`：`periodicalexecutor` + `chunkContainer`



> 所以你想完成自己的 `executor`，可以实现 `container` 的这3个接口，再结合 `periodicalexecutor` 就行



所以回到👆那张图，我们的重点就放在 `periodicalexecutor`，看看它是怎么设计的？


## 如何使用


首先看看如何在业务中使用这个组件：


现有一个定时服务，每天固定时间去执行从 `mysql` 到 `clickhouse` 的数据同步：


```go
type DailyTask struct {
	ckGroup        *clickhousex.Cluster
	insertExecutor *executors.BulkExecutor
	mysqlConn      sqlx.SqlConn
}
```


初始化 `bulkExecutor`：


```go
func (dts *DailyTask) Init() {
    // insertIntoCk() 是真正insert执行函数【需要开发者自己编写具体业务逻辑】
	dts.insertExecutor = executors.NewBulkExecutor(
		dts.insertIntoCk,
		executors.WithBulkInterval(time.Second*3),	// 3s会自动刷一次container中task去执行
		executors.WithBulkTasks(10240),				// container最大task数。一般设为2的幂次
	)
}
```


> 额外介绍一下：`clickhouse`  适合大批量的插入，因为insert速度很快，大批量insert更能充分利用clickhouse



主体业务逻辑编写：


```go
func (dts *DailyTask) insertNewData(ch chan interface{}, sqlFromDb *model.Task) error {
	for item := range ch {
		if r, vok := item.(*model.Task); !vok {
			continue
		}
		err := dts.insertExecutor.Add(r)
		if err != nil {
			r.Tag = sqlFromDb.Tag
			r.TagId = sqlFromDb.Id
			r.InsertId = genInsertId()
			r.ToRedis = toRedis == constant.INCACHED
			r.UpdateWay = sqlFromDb.UpdateWay
            // 1. Add Task
			err := dts.insertExecutor.Add(r)
			if err != nil {
				logx.Error(err)
			}
		}
	}
    // 2. Flush Task container
	dts.insertExecutor.Flush()
    // 3. Wait All Task Finish
	dts.insertExecutor.Wait()
}
```


> 可能会疑惑为什么要 `Flush(), Wait()` ，后面会通过源码解析一下



使用上总体上3步：


- `Add()`：加入task
- `Flush()`：刷新 `container` 中的task
- `Wait()`：等待全部的task执行完成



## 源码分析


> 此处主要分析 `periodicalexecutor`，因为其他两个常用的 `executor` 都依赖它



### 初始化


```go
func New...(interval time.Duration, container TaskContainer) *PeriodicalExecutor {
	executor := &PeriodicalExecutor{
		commander:   make(chan interface{}, 1),
		interval:    interval,
		container:   container,
		confirmChan: make(chan lang.PlaceholderType),
		newTicker: func(d time.Duration) timex.Ticker {
			return timex.NewTicker(interval)
		},
	}
    ...
	return executor
}
```


- `commander`：传递 `tasks` 的 channel
- `container`：暂存 `Add()` 的 task
- `confirmChan`：阻塞 `Add()` ，在开始本次的 `executeTasks()` 会放开阻塞
- `ticker`：定时器，防止 `Add()` 阻塞时，会有一个定时执行的机会，及时释放暂存的task



### Add()


初始化完，在业务逻辑的第一步就是把 task 加入 `executor`：


```go
func (pe *PeriodicalExecutor) Add(task interface{}) {
	if vals, ok := pe.addAndCheck(task); ok {
		pe.commander <- vals
		<-pe.confirmChan
	}
}

func (pe *PeriodicalExecutor) addAndCheck(task interface{}) (interface{}, bool) {
	pe.lock.Lock()
	defer func() {
        // 一开始为 false
		var start bool
		if !pe.guarded {
            // backgroundFlush() 会将 guarded 重新置反
			pe.guarded = true
			start = true
		}
		pe.lock.Unlock()
        // 在第一条 task 加入的时候就会执行 if 中的 backgroundFlush()。后台协程刷task
		if start {
			pe.backgroundFlush()
		}
	}()
	// 控制maxTask，>=maxTask 将container中tasks pop, return
	if pe.container.AddTask(task) {
		return pe.container.RemoveAll(), true
	}

	return nil, false
}
```


`addAndCheck()` 中 `AddTask()` 就是在控制最大 tasks 数，如果超过就执行 `RemoveAll()` ，将暂存 `container` 的tasks pop，传递给 `commander` ，后面有goroutine循环读取，然后去执行 tasks。


### backgroundFlush()


开启一个后台协程，对 `container` 中的task，不断刷新：


```go
func (pe *PeriodicalExecutor) backgroundFlush() {
    // 封装 go func(){}
	threading.GoSafe(func() {
		ticker := pe.newTicker(pe.interval)
		defer ticker.Stop()

		var commanded bool
		last := timex.Now()
		for {
			select {
            // 从channel拿到 []tasks
			case vals := <-pe.commander:
				commanded = true
                // 实质：wg.Add(1)
				pe.enterExecution()
                // 放开 Add() 的阻塞，而且此时暂存区也为空。才开始新的 task 加入
				pe.confirmChan <- lang.Placeholder
                // 真正的执行 task 逻辑
				pe.executeTasks(vals)
				last = timex.Now()
			case <-ticker.Chan():
				if commanded {
                    // 由于select选择的随机性，如果同时满足两个条件同时执行完上面的，此处置反，并跳过本段执行
                    // https://draveness.me/golang/docs/part2-foundation/ch05-keyword/golang-select/
					commanded = false
				} else if pe.Flush() {
                    // 刷新完成，定时器清零。暂存区空了，开始下一次定时刷新
					last = timex.Now()
				} else if timex.Since(last) > pe.interval*idleRound {
                    // 既没到maxTask，Flush() err，并且 last->now 时间过长，会再次触发 Flush()
                    // 只有这置反，才会开启一个新的 backgroundFlush() 后台协程
                    pe.guarded = false
					// 再次刷新，防止漏掉
					pe.Flush()
					return
				}
			}
		}
	})
}
```


总体两个过程：


- `commander` 接收到 `RemoveAll()` 传递来的tasks，然后做执行，并放开 `Add()` 的阻塞，得以继续 `Add()`
- `ticker` 到时间了，如果第一步没有执行，则自动 `Flush()` ，也会去做task的执行



### Wait()


在 `backgroundFlush()` ，提到一个函数：`enterExecution()`：


```go
func (pe *PeriodicalExecutor) enterExecution() {
	pe.wgBarrier.Guard(func() {
		pe.waitGroup.Add(1)
	})
}

func (pe *PeriodicalExecutor) Wait() {
	pe.wgBarrier.Guard(func() {
		pe.waitGroup.Wait()
	})
}
```


这样列举就知道为什么之前为什么在最后要带上 `dts.insertExecutor.Wait()`，当然要等待全部的 `goroutine task` 完成。


## 思考


在看源码中，思考了一些其他设计上的思路，大家是否也有类似的问题：


- 在分析 `executors` 中，会发现很多地方都有 `lock`



> `go test` 存在竞态，使用加锁来避免这种情况



- 在分析 `confirmChan` 发现，在此次[提交](https://github.com/tal-tech/go-zero/commit/9d9399ad1014c171cc9bd9c87f78b5d2ac238ce4)才出现，为什么会这么设计？



> 之前是：`wg.Add(1)` 是写在 `executeTasks()` ；现在是：先`wg.Add(1)`，再放开 `confirmChan` 阻塞
> 如果 `executor func` 执行阻塞，`Add task` 还在进行，因为没有阻塞，可能很快执行到 `Executor.Wait()`，这是就会出现 `wg.Wait()` 在 `wg.Add()` 前执行，这会 `panic`



具体可以看最新版本的`TestPeriodicalExecutor_WaitFast()` ，不妨跑在此版本上，就可以重现


## 总结


剩余还有几个 `executors` 的分析，就留给大家去看看源码。


总之，整体设计上：


- 遵循面向接口设计
- 灵活使用 `channel` ，`waitgroup` 等并发工具
- 执行单元+存储单元的搭配使用



在 `go-zero` 中还有很多实用的组件工具，用好工具对于提升服务性能和开发效率都有很大的帮助，希望本篇文章能给大家带来一些收获。

<Vssue :title="$title" />

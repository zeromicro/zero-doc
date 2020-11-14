# 2.5 redis lock

既然是锁，首先想到的一个作用就是：**防重复点击，在一个时间点只有一个请求产生效果**。


而既然是 `redis`，就得具有排他性，同时也具有锁的一些共性：


- 高性能
- 不能出现死锁
- 不能出现节点down掉后加锁失败



`go-zero` 中利用 redis `set key nx` 可以保证key不存在时写入成功，`px` 可以让key超时后自动删除「最坏情况也就是超时自动删除key，从而也不会出现死锁」


## example


```go
redisLockKey := fmt.Sprintf("%v%v", redisTpl, headId)
// 1. New redislock
redisLock := redis.NewRedisLock(redisConn, redisLockKey)
// 2. 可选操作，设置 redislock 过期时间
redisLock.SetExpire(redisLockExpireSeconds)
if ok, err := redisLock.Acquire(); !ok || err != nil {
  return nil, errors.New("当前有其他用户正在进行操作，请稍后重试")
}
defer func() {
  recover()
  // 3. 释放锁
  redisLock.Release()
}()
```


和你在使用 `sync.Mutex` 的方式时一致的。加锁解锁，执行你的业务操作。


## 获取锁


```go
lockCommand = `if redis.call("GET", KEYS[1]) == ARGV[1] then
    redis.call("SET", KEYS[1], ARGV[1], "PX", ARGV[2])
    return "OK"
else
    return redis.call("SET", KEYS[1], ARGV[1], "NX", "PX", ARGV[2])
end`

func (rl *RedisLock) Acquire() (bool, error) {
	seconds := atomic.LoadUint32(&rl.seconds)
  // execute luascript
	resp, err := rl.store.Eval(lockCommand, []string{rl.key}, []string{
		rl.id, strconv.Itoa(int(seconds)*millisPerSecond + tolerance)})
	if err == red.Nil {
		return false, nil
	} else if err != nil {
		logx.Errorf("Error on acquiring lock for %s, %s", rl.key, err.Error())
		return false, err
	} else if resp == nil {
		return false, nil
	}

	reply, ok := resp.(string)
	if ok && reply == "OK" {
		return true, nil
	} else {
		logx.Errorf("Unknown reply when acquiring lock for %s: %v", rl.key, resp)
		return false, nil
	}
}
```


先介绍几个 `redis` 的命令选项，以下是为 `set` 命令增加的选项：


- `ex seconds` ：设置key过期时间，单位s
- `px milliseconds` ：设置key过期时间，单位毫秒
- `nx`：key不存在时，设置key的值
- `xx`：key存在时，才会去设置key的值



其中 `lua script` 涉及的入参：



| **args** | **示例** | **含义** |
| --- | --- | --- |
| KEYS[1] | key$20201026 | redis key |
| ARGV[1] | lmnopqrstuvwxyzABCD | 唯一标识：随机字符串 |
| ARGV[2] | 30000 | 设置锁的过期时间 |



然后来说说代码特性：


1. `Lua` 脚本保证原子性「当然，把多个操作在 Redis 中实现成一个操作，也就是单命令操作」
1. 使用了 `set key value px milliseconds nx`
1. `value` 具有唯一性
1. 加锁时首先判断 `key` 的 `value` 是否和之前设置的一致，一致则修改过期时间



## 释放锁


```go
delCommand = `if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("DEL", KEYS[1])
else
    return 0
end`

func (rl *RedisLock) Release() (bool, error) {
	resp, err := rl.store.Eval(delCommand, []string{rl.key}, []string{rl.id})
	if err != nil {
		return false, err
	}

	if reply, ok := resp.(int64); !ok {
		return false, nil
	} else {
		return reply == 1, nil
	}
}
```


释放锁的时候只需要关注一点：


**不能释放别人的锁，不能释放别人的锁，不能释放别人的锁**


所以需要先 `get(key) == value「key」`，为 true 才会去 `delete`
``

<Vssue :title="$title" />

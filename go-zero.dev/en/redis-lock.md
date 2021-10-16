# redis lock
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

Since it is a lock, the first function that comes to mind is: **Anti-repeated clicks, only one request has an effect at a time**.


Since it is `redis`, it must be exclusive and also have some common features of locks:


- High performance
- No deadlock
- No lock failure after the node is down



In `go-zero`, redis `set key nx` can be used to ensure that the write is successful when the key does not exist. `px` can automatically delete the key after the timeout. "The worst case is that the key is automatically deleted after the timeout, so that there will be no death. lock"


## example


```go
redisLockKey := fmt.Sprintf("%v%v", redisTpl, headId)
// 1. New redislock
redisLock := redis.NewRedisLock(redisConn, redisLockKey)
// 2. Optional operation, set the redislock expiration time
redisLock.SetExpire(redisLockExpireSeconds)
if ok, err := redisLock.Acquire(); !ok || err != nil {
  return nil, errors.New("another user is currently operating, please try again later")
}
defer func() {
  recover()
  redisLock.Release()
}()
```


It is the same as when you use `sync.Mutex`. Lock and unlock, perform your business operations.


## Acquire the lock


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


First introduce several `redis` command options, the following are the added options for the `set` command:


- `ex seconds` : Set the key expiration time, in s
- `px milliseconds` : set the key expiration time in milliseconds
- `nx` : When the key does not exist, set the value of the key
- `xx` : When the key exists, the value of the key will be set



The input parameters involved in `lua script`:



| args | example | description |
| --- | --- | --- |
| KEYS[1] | key$20201026 | redis key |
| ARGV[1] | lmnopqrstuvwxyzABCD | Unique ID: random string |
| ARGV[2] | 30000 | Set the expiration time of the lock |



Then talk about the code features:


1. The `Lua` script guarantees atomicity "Of course, multiple operations are implemented as one operation in Redis, that is, a single command operation"
1. Use `set key value px milliseconds nx`
1. `value` is unique
1. When locking, first determine whether the `value` of the `key` is consistent with the previous setting, and modify the expiration time if it is consistent



## Release lock


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


You only need to pay attention to one point when releasing the lock:


**Can't release other people's locks, can't release other people's locks, can't release other people's locks**


Therefore, you need to first `get(key) == value「key」`, and then go to `delete` if it is true

# tokenlimit
本节将通过令牌桶限流（tokenlimit）来介绍其基本使用。

## 使用

```go
const (
	burst   = 100
	rate    = 100
	seconds = 5
)

store := redis.NewRedis("localhost:6379", "node", "")
fmt.Println(store.Ping())
// New tokenLimiter
limiter := limit.NewTokenLimiter(rate, burst, store, "rate-test")
timer := time.NewTimer(time.Second * seconds)
quit := make(chan struct{})
defer timer.Stop()
go func() {
  <-timer.C
  close(quit)
}()

var allowed, denied int32
var wait sync.WaitGroup
for i := 0; i < runtime.NumCPU(); i++ {
  wait.Add(1)
  go func() {
    for {
      select {
        case <-quit:
          wait.Done()
          return
        default:
          if limiter.Allow() {
            atomic.AddInt32(&allowed, 1)
          } else {
            atomic.AddInt32(&denied, 1)
          }
      }
    }
  }()
}

wait.Wait()
fmt.Printf("allowed: %d, denied: %d, qps: %d\n", allowed, denied, (allowed+denied)/seconds)
```


## tokenlimit

从整体上令牌桶生产token逻辑如下：
- 用户配置的平均发送速率为r，则每隔1/r秒一个令牌被加入到桶中；
- 假设桶中最多可以存放b个令牌。如果令牌到达时令牌桶已经满了，那么这个令牌会被丢弃；
- 当流量以速率v进入，从桶中以速率v取令牌，拿到令牌的流量通过，拿不到令牌流量不通过，执行熔断逻辑；



`go-zero` 在两类限流器下都采取 `lua script` 的方式，依赖redis可以做到分布式限流，`lua script`同时可以做到对 token 生产读取操作的原子性。

下面来看看 `lua script` 控制的几个关键属性：

| argument | mean |
| --- | --- |
| ARGV[1] | rate 「每秒生成几个令牌」 |
| ARGV[2] | burst 「令牌桶最大值」 |
| ARGV[3] | now_time「当前时间戳」 |
| ARGV[4] | get token nums 「开发者需要获取的token数」 |
| KEYS[1] | 表示资源的tokenkey |
| KEYS[2] | 表示刷新时间的key |



```lua
-- 返回是否可以活获得预期的token

local rate = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

-- fill_time：需要填满 token_bucket 需要多久
local fill_time = capacity/rate
-- 将填充时间向下取整
local ttl = math.floor(fill_time*2)

-- 获取目前 token_bucket 中剩余 token 数
-- 如果是第一次进入，则设置 token_bucket 数量为 令牌桶最大值
local last_tokens = tonumber(redis.call("get", KEYS[1]))
if last_tokens == nil then
    last_tokens = capacity
end

-- 上一次更新 token_bucket 的时间
local last_refreshed = tonumber(redis.call("get", KEYS[2]))
if last_refreshed == nil then
    last_refreshed = 0
end

local delta = math.max(0, now-last_refreshed)
-- 通过当前时间与上一次更新时间的跨度，以及生产token的速率，计算出新的token数
-- 如果超过 max_burst，多余生产的token会被丢弃
local filled_tokens = math.min(capacity, last_tokens+(delta*rate))
local allowed = filled_tokens >= requested
local new_tokens = filled_tokens
if allowed then
    new_tokens = filled_tokens - requested
end

-- 更新新的token数，以及更新时间
redis.call("setex", KEYS[1], ttl, new_tokens)
redis.call("setex", KEYS[2], ttl, now)

return allowed
```


上述可以看出 `lua script` ：只涉及对 token 操作，保证 token 生产合理和读取合理。


## 函数分析


![](https://cdn.nlark.com/yuque/0/2020/png/261626/1606107337223-7756ecdf-acb6-48c2-9ff5-959de01a1a03.png#align=left&display=inline&height=896&margin=%5Bobject%20Object%5D&originHeight=896&originWidth=2038&status=done&style=none&width=2038)


从上述流程中看出：


1. 有多重保障机制，保证限流一定会完成。
1. 如果`redis limiter`失效，至少在进程内`rate limiter`兜底。
1. 重试 `redis limiter` 机制保证尽可能地正常运行。



## 总结


`go-zero` 中的 `tokenlimit` 限流方案适用于瞬时流量冲击，现实请求场景并不以恒定的速率。令牌桶相当预请求，当真实的请求到达不至于瞬间被打垮。当流量冲击到一定程度，则才会按照预定速率进行消费。


但是生产`token`上，不能按照当时的流量情况作出动态调整，不够灵活，还可以进行进一步优化。此外可以参考[Token bucket WIKI](https://en.wikipedia.org/wiki/Token_bucket) 中提到分层令牌桶，根据不同的流量带宽，分至不同排队中。


## 参考

- [go-zero tokenlimit](https://github.com/zeromicro/go-zero/blob/master/core/limit/tokenlimit.go)
- [Go-Redis 提供的分布式限流库](https://github.com/go-redis/redis_rate)




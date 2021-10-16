# tokenlimit
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

This section will introduce its basic usage through token limit (tokenlimit).

## Usage

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

On the whole, the token bucket production logic is as follows:
- The average sending rate configured by the user is r, then a token is added to the bucket every 1/r second;
- Assume that at most b tokens can be stored in the bucket. If the token bucket is full when the token arrives, then the token will be discarded;
- When the traffic enters at the rate v, the token is taken from the bucket at the rate v, the traffic that gets the token passes, and the traffic that does not get the token does not pass, and the fuse logic is executed;



`go-zero` adopts the method of `lua script` under both types of current limiters, relying on redis to achieve distributed current limiting, and `lua script` can also achieve atomicity of token production and read operations.

Let's take a look at several key attributes controlled by `lua script`:

| argument | mean |
| --- | --- |
| ARGV[1] | rate 「How many tokens are generated per second」 |
| ARGV[2] | burst 「Maximum token bucket」 |
| ARGV[3] | now_time「Current timestamp」 |
| ARGV[4] | get token nums 「The number of tokens that the developer needs to obtain」 |
| KEYS[1] | Tokenkey representing the resource |
| KEYS[2] | The key that represents the refresh time |



```lua
-- Return whether the expected token can be obtained alive

local rate = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

-- fill_time：How long does it take to fill the token_bucket
local fill_time = capacity/rate
-- Round down the fill time
local ttl = math.floor(fill_time*2)

-- Get the number of remaining tokens in the current token_bucket
-- If it is the first time to enter, set the number of token_bucket to the maximum value of the token bucket
local last_tokens = tonumber(redis.call("get", KEYS[1]))
if last_tokens == nil then
    last_tokens = capacity
end

-- The time when the token_bucket was last updated
local last_refreshed = tonumber(redis.call("get", KEYS[2]))
if last_refreshed == nil then
    last_refreshed = 0
end

local delta = math.max(0, now-last_refreshed)
-- Calculate the number of new tokens based on the span between the current time and the last update time, and the rate of token production
-- If it exceeds max_burst, excess tokens produced will be discarded
local filled_tokens = math.min(capacity, last_tokens+(delta*rate))
local allowed = filled_tokens >= requested
local new_tokens = filled_tokens
if allowed then
    new_tokens = filled_tokens - requested
end

-- Update the new token number and update time
redis.call("setex", KEYS[1], ttl, new_tokens)
redis.call("setex", KEYS[2], ttl, now)

return allowed
```


It can be seen from the above that the `lua script`: only involves the operation of the token, ensuring that the token is produced and read reasonably.


## Function analysis


![](https://cdn.nlark.com/yuque/0/2020/png/261626/1606107337223-7756ecdf-acb6-48c2-9ff5-959de01a1a03.png#align=left&display=inline&height=896&margin=%5Bobject%20Object%5D&originHeight=896&originWidth=2038&status=done&style=none&width=2038)


Seen from the above flow:


1. There are multiple guarantee mechanisms to ensure that the current limit will be completed.
1. If the `redis limiter` fails, at least in the process `rate limiter` will cover it.
1. Retry the `redis limiter` mechanism to ensure that it runs as normally as possible.



## Summary


The `tokenlimit` current limiting scheme in `go-zero` is suitable for instantaneous traffic shocks, and the actual request scenario is not at a constant rate. The token bucket is quite pre-request, and when the real request arrives, it won't be destroyed instantly. When the traffic hits a certain level, consumption will be carried out at a predetermined rate.


However, in the production of `token`, dynamic adjustment cannot be made according to the current flow situation, and it is not flexible enough, and further optimization can be carried out. In addition, you can refer to [Token bucket WIKI](https://en.wikipedia.org/wiki/Token_bucket) which mentioned hierarchical token buckets, which are divided into different queues according to different traffic bandwidths.


## Reference

- [go-zero tokenlimit](https://github.com/zeromicro/go-zero/blob/master/core/limit/tokenlimit.go)
- [Redis Rate](https://github.com/go-redis/redis_rate)




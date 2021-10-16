# periodlimit

不管是在单体服务中还是在微服务中，开发者为前端提供的API接口都是有访问上限的，当访问频率或者并发量超过其承受范围时候，我们就必须考虑限流来保证接口的可用性或者降级可用性。即接口也需要安装上保险丝，以防止非预期的请求对系统压力过大而引起的系统瘫痪。


本文就来介绍一下 `periodlimit` 。
## 使用
```go
const (
    seconds = 1
    total   = 100
    quota   = 5
)
// New limiter
l := NewPeriodLimit(seconds, quota, redis.NewRedis(s.Addr(), redis.NodeType), "periodlimit")

// take source
code, err := l.Take("first")
if err != nil {
    logx.Error(err)
    return true
}

// switch val => process request
switch code {
	case limit.OverQuota:
		logx.Errorf("OverQuota key: %v", key)
		return false
	case limit.Allowed:
		logx.Infof("AllowedQuota key: %v", key)
		return true
	case limit.HitQuota:
		logx.Errorf("HitQuota key: %v", key)
		// todo: maybe we need to let users know they hit the quota
		return false
	default:
		logx.Errorf("DefaultQuota key: %v", key)
		// unknown response, we just let the sms go
    	return true
}
```
## periodlimit


`go-zero` 采取 **滑动窗口** 计数的方式，计算一段时间内对同一个资源的访问次数，如果超过指定的 `limit` ，则拒绝访问。当然如果你是在一段时间内访问不同的资源，每一个资源访问量都不超过 `limit` ，此种情况是允许大量请求进来的。


而在一个分布式系统中，存在多个微服务提供服务。所以当瞬间的流量同时访问同一个资源，如何让计数器在分布式系统中正常计数？ 同时在计算资源访问时，可能会涉及多个计算，如何保证计算的原子性？


- `go-zero` 借助 `redis` 的 `incrby` 做资源访问计数
- 采用 `lua script` 做整个窗口计算，保证计算的原子性



下面来看看 `lua script` 控制的几个关键属性：

| **argument** | **mean** |
| --- | --- |
| key[1] | 访问资源的标示 |
| ARGV[1] | limit => 请求总数，超过则限速。可设置为 QPS |
| ARGV[2] | window大小 => 滑动窗口，用 ttl 模拟出滑动的效果 |

```lua
-- to be compatible with aliyun redis, 
-- we cannot use `local key = KEYS[1]` to reuse thekey
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
-- incrbt key 1 => key visis++
local current = redis.call("INCRBY", KEYS[1], 1)
-- 如果是第一次访问，设置过期时间 => TTL = window size
-- 因为是只限制一段时间的访问次数
if current == 1 then
    redis.call("expire", KEYS[1], window)
    return 1
elseif current < limit then
    return 1
elseif current == limit then
    return 2
else
    return 0
end
```
至于上述的 `return code` ，返回给调用方。由调用方来决定请求后续的操作：

| **return code** | **tag** | call code | **mean** |
| --- | --- | --- | --- |
| 0 | OverQuota | 3 | **over limit** |
| 1 | Allowed | 1 | **in limit** |
| 2 | HitQuota | 2 | **hit limit** |

下面这张图描述了请求进入的过程，以及请求触发 `limit` 时后续发生的情况：
![image.png](https://cdn.nlark.com/yuque/0/2020/png/261626/1605430483430-92415ed3-e88f-487d-8fd6-8c58a9abe334.png#align=left&display=inline&height=524&margin=%5Bobject%20Object%5D&name=image.png&originHeight=524&originWidth=1051&size=90836&status=done&style=none&width=1051)
![image.png](https://cdn.nlark.com/yuque/0/2020/png/261626/1605495120249-f6b05ac2-7090-47b0-a3c0-da50df6206dd.png#align=left&display=inline&height=557&margin=%5Bobject%20Object%5D&name=image.png&originHeight=557&originWidth=456&size=53785&status=done&style=none&width=456)
## 后续处理


如果在服务某个时间点，请求大批量打进来，`periodlimit` 短期时间内达到 `limit` 阈值，而且设置的时间范围还远远没有到达。后续请求的处理就成为问题。


`periodlimit` 中并没有处理，而是返回 `code` 。把后续请求的处理交给了开发者自己处理。


1. 如果不做处理，那就是简单的将请求拒绝
1. 如果需要处理这些请求，开发者可以借助 `mq` 将请求缓冲，减缓请求的压力
1. 采用 `tokenlimit`，允许暂时的流量冲击



所以下一篇我们就来聊聊 `tokenlimit`


## 总结
`go-zero` 中的 `periodlimit` 限流方案是基于 `redis` 计数器，通过调用 `redis lua script` ，保证计数过程的原子性，同时保证在分布式的情况下计数是正常的。但是这种方案存在缺点，因为它要记录时间窗口内的所有行为记录，如果这个量特别大的时候，内存消耗会变得非常严重。


## 参考


- [go-zero periodlimit](https://github.com/zeromicro/go-zero/blob/master/core/limit/periodlimit.go)
- [分布式服务限流实战，已经为你排好坑了](https://www.infoq.cn/article/Qg2tX8fyw5Vt-f3HH673)
- [tokenlimit](tokenlimit.md)






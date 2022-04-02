# periodlimit
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

Whether in a single service or in a microservice, the API interface provided by the developer for the front end has an upper limit of access. When the frequency of access or the amount of concurrency exceeds its tolerance, we must consider current limit to ensure the interface. Availability or degraded availability. That is, the interface also needs to be installed with a fuse to prevent the system from being paralyzed due to excessive pressure on the system by unexpected requests.


This article will introduce `periodlimit`.
## Usage
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


`go-zero` adopts a **sliding window** counting method to calculate the number of accesses to the same resource within a period of time. If it exceeds the specified `limit`, access is denied. Of course, if you are accessing different resources within a period of time, the amount of access to each resource does not exceed the `limit`. In this case, a large number of requests are allowed to come in.


In a distributed system, there are multiple microservices to provide services. So when instantaneous traffic accesses the same resource at the same time, how to make the counter count normally in the distributed system? At the same time, when computing resources are accessed, multiple calculations may be involved. How to ensure the atomicity of calculations?


- `go-zero` counts resource visits with the help of `incrby` of `redis`
- Use `lua script` to do the whole window calculation to ensure the atomicity of calculation



Let's take a look at several key attributes controlled by `lua script`:

| **argument** | **mean** |
| --- | --- |
| key[1] | Logo for access to resources |
| ARGV[1] | limit => the total number of requests, if it exceeds the rate limit. Can be set to QPS |
| ARGV[2] | window size => sliding window, use ttl to simulate the effect of sliding |

```lua
-- to be compatible with aliyun redis, 
-- we cannot use `local key = KEYS[1]` to reuse thekey
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
-- incrbt key 1 => key visis++
local current = redis.call("INCRBY", KEYS[1], 1)
-- If it is the first visit, set the expiration time => TTL = window size
-- Because it only limits the number of visits for a period
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
As for the above `return code`, return it to the caller. The caller decides to request subsequent operations:

| **return code** | **tag** | call code | **mean** |
| --- | --- | --- | --- |
| 0 | OverQuota | 3 | **over limit** |
| 1 | Allowed | 1 | **in limit** |
| 2 | HitQuota | 2 | **hit limit** |

The following picture describes the process of request entry and the subsequent situation when the request triggers `limit`:
![image.png](https://raw.githubusercontent.com/zeromicro/zero-doc/main/doc/images/periodlimit-1.png)
![image.png](https://raw.githubusercontent.com/zeromicro/zero-doc/main/doc/images/periodlimit-2.png)

## Subsequent processing


If a large batch of requests comes in at a certain point in the service, the `periodlimit` reaches the `limit` threshold in a short period of time, and the set time range is far from reaching. The processing of subsequent requests becomes a problem.


It is not processed in `periodlimit`, but `code` is returned. The processing of subsequent requests is left to the developer.


1. If it is not processed, it is simply to reject the request
2. If these requests need to be processed, developers can use `mq` to buffer the requests to ease the pressure of the requests
3. Use `tokenlimit` to allow temporary traffic impact



So in the next article, we will talk about `tokenlimit`


## Summary
The `periodlimit` current limiting scheme in `go-zero` is based on `redis` counters. By calling `redis lua script`, it guarantees the atomicity of the counting process and guarantees that the counting is normal under distributed conditions. However, this scheme has disadvantages because it needs to record all behavior records within the time window. If this amount is particularly large, memory consumption will become very serious.


## Reference

- [go-zero periodlimit](https://github.com/zeromicro/go-zero/blob/master/core/limit/periodlimit.go)
- [Distributed service current limit actual combat, has already lined up the pits for you](https://www.infoq.cn/article/Qg2tX8fyw5Vt-f3HH673)
- [tokenlimit](tokenlimit.md)






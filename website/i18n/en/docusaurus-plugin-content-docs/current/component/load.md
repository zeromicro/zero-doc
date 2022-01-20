---
sidebar_position: 6
---

# Overload Protection

### Why you need to downgrade your load

In a microservice cluster, the invocation link is complex, and as a service provider, it needs a mechanism to protect itself to prevent the caller from overwhelming itself with mindless invocations and ensure the high availability of its own services.

The most common protection mechanism is flow limiting mechanism, the premise of using flow limiter is to know the maximum number of concurrency that it can handle, and generally get the maximum number of concurrency by pressure testing before going online, and the flow limiting parameters of each interface are different in the daily request process, while the system has been constantly iterating and its processing capacity often changes, so it needs to pressure test and adjust the flow limiting parameters before going online each time. The parameters become very tedious.

So is there a more concise flow-limiting mechanism that can achieve maximum self-protection?

### What is Adaptive Load Shedding

Adaptive load shedding protects the service itself very intelligently and dynamically determines whether load shedding is needed based on the service's own system load.

Design Objective.

- Ensure that the system does not get bogged down.
- Maintain system throughput while the system is stable.

The key then is how to measure the load on the service itself?

Judging high load depends on two main indicators.

- Whether the cpu is overloaded.
- Whether the maximum concurrency is overloaded.

When the above two points are met at the same time, it means that the service is in a high load state, then the adaptive down load.

It should also be noted that high concurrency scenarios cpu load, concurrency often fluctuate greatly, from the data we call this phenomenon burr, burr phenomenon may lead to the system has been frequent automatic down load operation, so we generally get the average value of indicators over a period of time to make the indicators more smooth. The implementation can be done by accurately recording the metrics over a period of time and then directly calculating the average value, but it takes up some system resources.

There is a statistical algorithm: exponential moving average, which can be used to estimate the local average of variables, so that the update of variables is related to the historical values over time, and the average can be estimated without recording all the historical local variables, which saves valuable server resources.

The principle of the sliding average algorithm is explained very clearly in this article.

The variable V is denoted as Vt at time t and θt is the value of the variable V at time t. That is, Vt = θt when the sliding average model is not used, and after using the sliding average model, Vt is updated by the following equation.
```shell
Vt=β⋅Vt−1+(1−β)⋅θt
```

- Vt = θt for β = 0
- β = 0.9, which is approximately the average of the last 10 θt values
- β = 0.99, which is approximately the average of the last 100 θt values

### Code implementation

Next, let's look at the code implementation of go-zero adaptive downgrading.

![load](/img/load.png)

Adaptive load shedding interface definition.

```go title="core/load/adaptiveshedder.go"
// Callback functions
Promise interface {
    // Callback to this function on successful request
    Pass()
    // Callback to this function on request failure
    Fail()
}

// Definition of the drop-load interface
Shedder interface {
    // Drop check
    // 1. Allow the call, you need to manually execute Promise.accept()/reject() to report the actual execution task structure
    // 2. Reject the call and it will return err: Service Overloaded Error ErrServiceOverloaded
    Allow() (Promise, error)
}
```

The interface definition is very concise meaning that it is actually very simple to use, exposing an `Allow()(Promise,error) to the outside world.

Example of go-zero usage.

The business only needs to call the method to determine whether to dowload, if it is dowloaded then directly end the process, otherwise the execution of the business finally use the return value Promise according to the results of the implementation of the callback results can be.

```go
func UnarySheddingInterceptor(shedder load.Shedder, metrics *stat.Metrics) grpc.UnaryServerInterceptor {
    ensureSheddingStat()

    return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo,
        handler grpc.UnaryHandler) (val interface{}, err error) {
        sheddingStat.IncrementTotal()
        var promise load.Promise
        // Check for downgrades
        promise, err = shedder.Allow()
        // Drop load, record relevant logs and metrics
        if err != nil {
            metrics.AddDrop()
            sheddingStat.IncrementDrop()
            return
        }
        // Final callback execution result
        defer func() {
            // Execution Failure
            if err == context.DeadlineExceeded {
                promise.Fail()
            // Successful implementation
            } else {
                sheddingStat.IncrementPass()
                promise.Pass()
            }
        }()
        // Implementation of business methods
        return handler(ctx, req)
    }
}
```

Definition of interface implementation classes.

There are three main types of properties

- cpu load threshold: exceeding this value means the cpu is in a high load state.
- Cooling period: If the service has been down loaded before, it will enter the cooling period, in order to prevent the load from being down during the down load process and immediately pressurize it to cause back and forth jitter. Because it takes some time to reduce the load, you should continue to check whether the number of concurrency exceeds the limit during the cooling-off period, and continue to discard requests if the limit is exceeded.
- Concurrency number: the number of concurrency currently being processed, the average number of concurrency currently being processed, and the number of requests and response time in the recent period, the purpose is to calculate whether the number of concurrency currently being processed is greater than the maximum number of concurrency that can be carried by the system.

```go
// option parameter mode
ShedderOption func(opts *shedderOptions)

// Optional configuration parameters
shedderOptions struct {
    // Sliding time window size
    window time.Duration
    // Number of sliding time windows
    buckets int
    // cpu load threshold
    cpuThreshold int64
}

// Adaptive load drop structure, need to implement Shedder interface
adaptiveShedder struct {
    // cpu load threshold
    // Higher than the threshold means high load needs to be downgraded to ensure service
    cpuThreshold int64
    // How many barrels in 1s
    windows int64
    // Number of concurrent
    flying int64
    // Sliding and smoothing the number of concurrent
    avgFlying float64
    // Spin locks, one service shares one drop load
    // Locks must be applied when counting the number of requests currently being processed
    // lossless concurrency for better performance
    avgFlyingLock syncx.SpinLock
    // Last rejection time
    dropTime *syncx.AtomicDuration
    // Have you been rejected recently
    droppedRecently *syncx.AtomicBool
    // Request statistics, with a sliding time window to record metrics over the most recent period
    passCounter *collection.RollingWindow
    // Response time statistics by sliding time windows to record metrics over the most recent period
    rtCounter *collection.RollingWindow
}
```

Adaptive load shedding constructor：

```go
func NewAdaptiveShedder(opts ...ShedderOption) Shedder {
    // To ensure code uniformity
    // To return the default empty implementation when the developer closes, for code uniformity
    // go-zero uses this design in many places, such as Breaker, the logging component
    if !enabled.True() {
        return newNopShedder()
    }
    // options mode sets optional configuration parameters
    options := shedderOptions{
        // Default statistics for the last 5s
        window: defaultWindow,
        // Default barrel quantity 50
        buckets:      defaultBuckets,
        // cpu load
        cpuThreshold: defaultCpuThreshold,
    }
    for _, opt := range opts {
        opt(&options)
    }
    // Calculate each window interval time, default is 100ms
    bucketDuration := options.window / time.Duration(options.buckets)
    return &adaptiveShedder{
        // cpu load
        cpuThreshold:    options.cpuThreshold,
        // How many sliding window cells are included in 1s time
        windows:         int64(time.Second / bucketDuration),
        // Last rejection time
        dropTime:        syncx.NewAtomicDuration(),
        // Have you been rejected recently
        droppedRecently: syncx.NewAtomicBool(),
        // qps statistics, sliding time window
        // Ignore the current writing window (bucket), incomplete time period may lead to data anomalies
        passCounter: collection.NewRollingWindow(options.buckets, bucketDuration,
            collection.IgnoreCurrentBucket()),
        // Response time statistics, sliding time window
        // Ignore the current writing window (bucket), incomplete time period may lead to data anomalies
        rtCounter: collection.NewRollingWindow(options.buckets, bucketDuration,
            collection.IgnoreCurrentBucket()),
    }
}

```

Drop Load Check Allow().

Check whether the current request should be discarded, is discarded business side needs to directly interrupt the request to protect the service, also means that the downgrade takes effect while entering the cooling off period. If it is allowed, it returns promise and waits for the business side to execute the callback function to perform the metrics statistics.

```go
// Down load check
func (as *adaptiveShedder) Allow() (Promise, error) {
    // Check if the request was discarded
    if as.shouldDrop() {
        // Set drop time
        as.dropTime.Set(timex.Now())
        // Recently dropped
        as.droppedRecently.Set(true)
        // Return to Overload
        return nil, ErrServiceOverloaded
    }
    // Number of requests being processed plus 1
    as.addFlying(1)
    // Each allowed request here returns a new promise object
    // The promise holds the drop pointer object internally
    return &promise{
        start:   timex.Now(),
        shedder: as,
    }, nil
}
```

Check if shouldDrop() should be dropped.

```go
// Whether the request should be discarded
func (as *adaptiveShedder) shouldDrop() bool {
    // The current cpu load exceeds the threshold
    // Service should continue to check load and try to discard requests while on cooldown
    if as.systemOverloaded() || as.stillHot() {
        // Check if the concurrency being processed exceeds the current maximum number of concurrency that can be carried
       // Discard the request if it exceeds it
        if as.highThru() {
            flying := atomic.LoadInt64(&as.flying)
            as.avgFlyingLock.Lock()
            avgFlying := as.avgFlying
            as.avgFlyingLock.Unlock()
            msg := fmt.Sprintf(
                "dropreq, cpu: %d, maxPass: %d, minRt: %.2f, hot: %t, flying: %d, avgFlying: %.2f",
                stat.CpuUsage(), as.maxPass(), as.minRt(), as.stillHot(), flying, avgFlying)
            logx.Error(msg)
            stat.Report(msg)
            return true
        }
    }
    return false
}
```

cpu threshold check systemOverloaded().

The cpu load value calculation algorithm uses the sliding average algorithm to prevent burr phenomenon. Sampling every 250ms β is 0.95, which is roughly equivalent to the average of 20 cpu loadings in history, with a time period of about 5s.
```go
// Is the cpu overloaded
func (as *adaptiveShedder) systemOverloaded() bool {
    return systemOverloadChecker(as.cpuThreshold)
}

// cpu check function
systemOverloadChecker = func(cpuThreshold int64) bool {
        return stat.CpuUsage() >= cpuThreshold
}

// cpu sliding average
curUsage := internal.RefreshCpu()
prevUsage := atomic.LoadInt64(&cpuUsage)
// cpu = cpuᵗ⁻¹ * beta + cpuᵗ * (1 - beta)
// Sliding average algorithm
usage := int64(float64(prevUsage)*beta + float64(curUsage)*(1-beta))
atomic.StoreInt64(&cpuUsage, usage)
```

Check if it is stillHot:

Determine whether the current system is in the cooling period, if in the cooling period, you should continue to try to check whether to discard the request. The main purpose is to prevent the system in the process of overload recovery before the load has come down, and immediately increase the pressure again resulting in back and forth jitter, at this time should try to continue to discard the request.
```go
func (as *adaptiveShedder) stillHot() bool {
    // No recent requests have been discarded
    // means the service is working
    if !as.droppedRecently.True() {
        return false
    }
    // Not in cooling period
    dropTime := as.dropTime.Load()
    if dropTime == 0 {
        return false
    }
    // Cooling time default is 1s
    hot := timex.Since(dropTime) < coolOffDuration
    // Not in cooling-off period, normal processing of requests in progress
    if !hot {
        // Reset drop records
        as.droppedRecently.Set(false)
    }

    return hot
}
```

Check the number of concurrency currently being processed highThru().

Once the number of concurrency currently being processed > the concurrency carrying limit, then it enters the down load state.

Why do we need to add a lock here? Because adaptive downgrading is used globally to ensure that the concurrency average is correct.

Why do we need to add spin locks here? Because concurrency processing can be performed without blocking other goroutines, and lock-free concurrency can be used to improve performance.

```go
func (as *adaptiveShedder) highThru() bool {
    // Add lock
    as.avgFlyingLock.Lock()
    // Get the sliding average
    // Update at the end of each request
    avgFlying := as.avgFlying
    // Unlock
    as.avgFlyingLock.Unlock()
    // Maximum concurrency of the system at this time
    maxFlight := as.maxFlight()
    // Whether the number of concurrency being processed and the average concurrency is greater than the system's maximum concurrency
    return int64(avgFlying) > maxFlight && atomic.LoadInt64(&as.flying) > maxFlight
}
```

How can we get the number of concurrency being processed and the average number of concurrency?

The current concurrency count is actually very simple: +1 concurrency for each allowed request, -1 for the promise object callback after the request is completed, and the average concurrency can be solved using the sliding average algorithm.

```go
type promise struct {
    // Request start time
    // Statistics on request processing time
    start   time.Duration
    shedder *adaptiveShedder
}

func (p *promise) Fail() {
    // End of request, number of requests currently being processed - 1
    p.shedder.addFlying(-1)
}

func (p *promise) Pass() {
    // Response time in milliseconds
    rt := float64(timex.Since(p.start)) / float64(time.Millisecond)
    // End of request, number of requests currently being processed - 1
    p.shedder.addFlying(-1)
    p.shedder.rtCounter.Add(math.Ceil(rt))
    p.shedder.passCounter.Add(1)
}

func (as *adaptiveShedder) addFlying(delta int64) {
    flying := atomic.AddInt64(&as.flying, delta)
    // When the request is finished, count the concurrency of requests currently being processed
    if delta < 0 {
        as.avgFlyingLock.Lock()
        // Estimate the average number of requests for the current service over a recent period of time
        as.avgFlying = as.avgFlying*flyingBeta + float64(flying)*(1-flyingBeta)
        as.avgFlyingLock.Unlock()
    }
}

```

It is not enough to get the current system count, we also need to know the maximum number of concurrent requests that the system can handle, i.e., the maximum number of concurrent requests.

The number of requests passed and the response time are both achieved by a sliding window, which can be found in the article on adaptive fusers.

The maximum concurrency of the current system = the maximum number of passes per unit time of the window * the minimum response time per unit time of the window.

```go
// Calculate the maximum number of concurrency of the system per second
// Maximum concurrency = maximum requests (qps) * minimum response time (rt)
func (as *adaptiveShedder) maxFlight() int64 {
    // windows = buckets per second
    // maxQPS = maxPASS * windows
    // minRT = min average response time in milliseconds
    // maxQPS * minRT / milliseconds_per_second
    // as.maxPass() * as.windows - maximum qps per bucket * number of buckets contained in 1s
    // as.minRt()/1e3 - the smallest average response time of all buckets in the window / 1000ms here to convert to seconds
    return int64(math.Max(1, float64(as.maxPass()*as.windows)*(as.minRt()/1e3)))
}

// Sliding time window with multiple buckets
// Find the one with the highest number of requests
// Each bucket takes up internal ms
// qps refers to the number of requests in 1s, qps: maxPass * time.Second/internal
func (as *adaptiveShedder) maxPass() int64 {
    var result float64 = 1
    // The bucket with the highest number of requests in the current time window
    as.passCounter.Reduce(func(b *collection.Bucket) {
        if b.Sum > result {
            result = b.Sum
        }
    })

    return int64(result)
}

// Sliding time window with multiple buckets
// Calculate the minimum average response time
// because it is necessary to calculate the maximum number of concurrency that the system can handle in a recent period of time
func (as *adaptiveShedder) minRt() float64 {
    // Default is 1000ms
    result := defaultMinRt

    as.rtCounter.Reduce(func(b *collection.Bucket) {
        if b.Count <= 0 {
            return
        }
        // Average response time for requests
        avg := math.Round(b.Sum / float64(b.Count))
        if avg < result {
            result = avg
        }
    })

    return result
}
```

### Reference

[Google BBR Congestion Control Algorithm](https://queue.acm.org/detail.cfm?id=3022184)

[Principle of sliding average algorithm](https://www.cnblogs.com/wuliytTaotao/p/9479958.html)

[go-zero adaptive load shedding](https://go-zero.dev/cn/loadshedding.html)
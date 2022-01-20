---
sidebar_position: 5
---

# Circuit Breaker

### Circuit Breaker Principle

The fuse mechanism is actually a reference to the protection mechanism of fuses in our daily life. When a circuit is overloaded, the fuse will automatically break, thus ensuring that the electrical appliances in the circuit will not be damaged. The fuse mechanism in service governance refers to the fact that if the error rate returned by the invoked party exceeds a certain threshold when a service call is initiated, then subsequent requests will not be initiated, but the error will be returned directly by the invoker.

In this model, the service caller maintains a state machine for each invoked service (invocation path), in which there are three states:

* Closed: In this state, we need a counter to record the number of failed calls and the total number of requests. If the failure rate reaches a preset threshold within a certain time window, it switches to the disconnected state, which opens a timeout period, and switches to the semi-closed state when the time is reached, which gives the system a chance to fix the The timeout is to give the system a chance to fix the error that caused the call to fail, in order to return to the normal working state. In the off state, the invocation error is time-based and is reset at specific intervals, which prevents accidental errors from causing the fuse to go into the off state.

* Open: In this state, the request will immediately return an error, will generally start a timeout timer, when the timer times out, the state switches to a semi-open state, you can also set a timer to regularly detect whether the service is restored.

* Half-Open: In this state, the application is allowed to send a certain number of requests to the called service, if these calls are normal, then the called service can be considered to have recovered normally, at this time the fuse switches to the closed state, and the count needs to be reset at the same time. If this part still has call failures, then it is considered that the called party still has not recovered, the fuse will switch to the closed state and then reset the counter. The half-open state can effectively prevent the service that is recovering from being broken again by a sudden large number of requests.

![breaker](/img/breaker.png)

### Adaptive Circuit Breaker

`go-zero` referenced [`Google Sre`](https://landing.google.com/sre/sre-book/chapters/handling-overload/)，The principle of the algorithm is as follows:

When a service is overloaded, a request should arrive and be quickly rejected, returning a "service overload" type error, which should consume far fewer resources than actually processing the request. However, this logic does not really apply to all requests. For example, rejecting a request to perform a simple memory query may consume about the same amount of memory as actually performing the request (since the main consumption here is in the application layer protocol parsing, where the result generation part is simple). Even if, in some cases, denying a request saves a lot of resources, sending these denial replies still consumes a certain amount of resources. If the number of rejection replies is also large, these resource consumptions may also be significant. In this case, it is possible that the service will go into overload as well while it is busy constantly sending rejection replies.

Client-side throttling solves this problem. When a client detects that a large portion of recent request errors are due to "service overload" errors, the client starts to limit the speed of requests on its own, limiting the number of requests it generates. Requests that exceed this request count limit fail directly in the local reply, and are not actually sent to the network layer.

We use a technique called adaptive throttling to implement client throttling. Specifically, each client records the following information for the past two minutes.

* requests The total number of all requests made by the application layer code, referring to the application code running on top of the adaptive throttling system.

* accept Number of requests accepted by back-end tasks.

In the regular case, these two values are equal. As the back-end tasks start rejecting requests, the number of requests accepted starts to be smaller than the number of requests. The client can continue sending requests until requests=K * accepts, once this limit is exceeded, the client starts throttling itself and new requests are rejected directly locally (within the client) with a certain probability, which is calculated using the following metric.

![breaker](/img/breaker_algo.png)

As the client begins to reject requests on its own, requests continue to rise while continuing past accepts. here, while it may seem counterintuitive that locally rejected requests don't actually reach the backend, this is precisely the point of this algorithm. As the client sends requests faster (relative to the speed at which the backend accepts them), we want to increase the probability that a request is dropped locally.

We found that the adaptive throttling algorithm works well in practice and can maintain a very stable request rate overall. The back-end service can essentially maintain a 50% processing rate even in the case of mega-overloads. A major advantage of this approach is that the client relies entirely on local information to make decisions, while the implementation algorithm is relatively simple: no additional dependencies are added and no latency is affected.

For systems where the resources consumed to process the request and the resources used to reject it are not very different, it may not be reasonable to allow 50% of the resources to be used to send the rejection request. In this case, the solution is simple: by modifying the multiplicity K of the algorithm's accepts in the client (e.g., 2) it is possible to solve.

* Decreasing this multiplier will make the adaptive throttling algorithm more aggressive.

* Increasing this multiplier will make the algorithm less aggressive.

For example, suppose the upper limit of client requests is adjusted from request=2 * accepts to request=1.1* accepts, which means that only 1 out of every 10 backend requests will be rejected. The general recommendation is to use K=2, which wastes a certain amount of backend resources by allowing the backend to receive more requests than expected, but speeds up the delivery of backend state to the client. For example, after the backend stops rejecting requests from that client, the time taken by all clients to detect the change is reduced.

```go title="go-zero/core/breaker/googlebreaker.go"
type googleBreaker struct {
    k     float64  
    stat  *collection.RollingWindow 
    proba *mathx.Proba 
}
```

Algorithm Implementation：

```go title="go-zero/core/breaker/googlebreaker.go"
func (b *googleBreaker) accept() error {
    accepts, total := b.history()  
    weightedAccepts := b.k * float64(accepts)
    dropRatio := math.Max(0, (float64(total-protection)-weightedAccepts)/float64(total+1))
    if dropRatio <= 0 {
        return nil
    }
    if b.proba.TrueOnProba(dropRatio) {
        return ErrServiceUnavailable
    }

    return nil
}
```

The doReq method is called each time a request is initiated. In this method, the first check is made by accepting whether the fuse is triggered. acceptable is used to determine which errors count towards the failure count, as defined below.

```go title="go-zero/zrpc/internal/codes/accept.go"
func Acceptable(err error) bool {
    switch status.Code(err) {
    case codes.DeadlineExceeded, codes.Internal, codes.Unavailable, codes.DataLoss: 
        return false
    default:
        return true
    }
}
```

If the request is normal, both the number of requests and the number of requests accepted will be added by one by markSuccess, if the request is not normal, only the number of requests will be added by one

```go title="go-zero/core/breaker/googlebreaker.go"
func (b *googleBreaker) doReq(req func() error, fallback func(err error) error, acceptable Acceptable) error {
  if err := b.accept(); err != nil {
        if fallback != nil {
            return fallback(err)
        } else {
            return err
        }
    }

    defer func() {
        if e := recover(); e != nil {
            b.markFailure()
            panic(e)
        }
    }()

    err := req()
    if acceptable(err) {
        b.markSuccess()
    } else {
        b.markFailure()
    }

    return err
}
```

### Usage examples

go-zero framework fuse protection is enabled by default, no additional configuration is required

:::tip
If you want to implement fusion in a non-go-zero project, you can also port it over separately
:::

The following error is reported when the fuse is triggered：

```go title="go-zero/core/breaker/breaker.go"
var ErrServiceUnavailable = errors.New("circuit breaker is open")
````

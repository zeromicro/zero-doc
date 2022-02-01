# Trace
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)


## Foreword

In the microservice architecture, the call chain may be very long, from `http` to `rpc`, and from `rpc` to `http`. Developers want to know the call status and performance of each link, the best solution is **full link tracking**.

The tracking method is to generate its own `spanID` at the beginning of a request, and pass it down along the entire request link. We use this `spanID` to view the status of the entire link and performance issues.

Let's take a look at the link implementation of `go-zero`.

## Code structure

- [spancontext](https://github.com/zeromicro/go-zero/blob/master/core/trace/spancontext.go) ：保存链路的上下文信息「traceid，spanid，或者是其他想要传递的内容」
- [span](https://github.com/zeromicro/go-zero/blob/master/core/trace/span.go) ：链路中的一个操作，存储时间和某些信息
- [propagator](https://github.com/zeromicro/go-zero/blob/master/core/trace/propagator.go) ： `trace` 传播下游的操作「抽取，注入」
- [noop](https://github.com/zeromicro/go-zero/blob/master/core/trace/noop.go) ：实现了空的 `tracer` 实现

![](https://static.gocn.vip/photo/2020/2f244477-4ed3-4ad1-8003-ff82cbe2f8a0.png?x-oss-process=image/resize,w_1920)

## Concept

### SpanContext

Before introducing `span`, first introduce `context`. SpanContext saves the context information of distributed tracing, including Trace id, Span id and other content that needs to be passed downstream. The implementation of OpenTracing needs to pass the SpanContext through a certain protocol to associate the Span in different processes to the same Trace. For HTTP requests, SpanContext is generally passed using HTTP headers.

Below is the `spanContext` implemented by `go-zero` by default

```go
type spanContext struct {
    traceId string      // TraceID represents the globally unique ID of tracer
    spanId  string      // SpanId indicates the unique ID of a span in a single trace, which is unique in the trace
}
```

At the same time, developers can also implement the interface methods provided by `SpanContext` to realize their own contextual information transfer:

```go
type SpanContext interface {
    TraceId() string                        // get TraceId
    SpanId() string                         // get SpanId
    Visit(fn func(key, val string) bool)    // Custom operation TraceId, SpanId
}
```

### Span

A REST call or database operation, etc., can be used as a `span`. `span` is the smallest tracking unit of distributed tracing. A trace is composed of multiple spans. The tracking information includes the following information:

```go
type Span struct {
    ctx           spanContext       
    serviceName   string           
    operationName string           
    startTime     time.Time         
    flag          string           
    children      int              
}
```

Judging from the definition structure of `span`: In microservices, this is a complete sub-calling process, with the start of the call `startTime`, the context structure `spanContext` that marks its own unique attribute, and the number of child nodes of fork.

## Example application

In `go-zero`, http and rpc have been integrated as built-in middleware. We use [http](https://github.com/zeromicro/go-zero/blob/master/rest/handler/tracinghandler.go), [rpc](https://github.com/zeromicro/go-zero/blob/master/zrpc/internal/clientinterceptors/tracinginterceptor.go), take a look at how `tracing` is used:

### HTTP

```go
func TracingHandler(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // **1**
        carrier, err := trace.Extract(trace.HttpFormat, r.Header)
        // ErrInvalidCarrier means no trace id was set in http header
        if err != nil && err != trace.ErrInvalidCarrier {
            logx.Error(err)
        }

        // **2**
        ctx, span := trace.StartServerSpan(r.Context(), carrier, sysx.Hostname(), r.RequestURI)
        defer span.Finish()
        // **5**
        r = r.WithContext(ctx)

        next.ServeHTTP(w, r)
    })
}

func StartServerSpan(ctx context.Context, carrier Carrier, serviceName, operationName string) (
    context.Context, tracespec.Trace) {
    span := newServerSpan(carrier, serviceName, operationName)
    // **4**
    return context.WithValue(ctx, tracespec.TracingKey, span), span
}

func newServerSpan(carrier Carrier, serviceName, operationName string) tracespec.Trace {
    // **3**
    traceId := stringx.TakeWithPriority(func() string {
        if carrier != nil {
            return carrier.Get(traceIdKey)
        }
        return ""
    }, func() string {
        return stringx.RandId()
    })
    spanId := stringx.TakeWithPriority(func() string {
        if carrier != nil {
            return carrier.Get(spanIdKey)
        }
        return ""
    }, func() string {
        return initSpanId
    })

    return &Span{
        ctx: spanContext{
            traceId: traceId,
            spanId:  spanId,
        },
        serviceName:   serviceName,
        operationName: operationName,
        startTime:     timex.Time(),
        // 标记为server
        flag:          serverFlag,
    }
}
```

1. Set header -> carrier to get the traceId and other information in the header
1. Open a new span and encapsulate **"traceId, spanId"** in the context
1. Obtain traceId and spanId from the aforementioned carrier "that is, header"
   -See if it is set in the header
   -If it is not set, it will be randomly generated and returned
1. Generate a new ctx from `request`, encapsulate the corresponding information in ctx, and return
1. From the above context, copy a copy to the current `request`

![](https://static.gocn.vip/photo/2020/a30daba2-ad12-477c-8ce5-131ef1cc3e76.png?x-oss-process=image/resize,w_1920)

In this way, the information of the `span` is passed to the downstream service along with the `request`.

### RPC

There are `client, server` in rpc, so from `tracing` there are also `clientTracing, serverTracing`. The logic of `serveTracing` is basically the same as that of http. Let’s take a look at how `clientTracing` is used?

```go
func TracingInterceptor(ctx context.Context, method string, req, reply interface{},
    cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
    // open clientSpan
    ctx, span := trace.StartClientSpan(ctx, cc.Target(), method)
    defer span.Finish()

    var pairs []string
    span.Visit(func(key, val string) bool {
        pairs = append(pairs, key, val)
        return true
    })
    // **3** Add the data in the pair to ctx in the form of a map
    ctx = metadata.AppendToOutgoingContext(ctx, pairs...)

    return invoker(ctx, method, req, reply, cc, opts...)
}

func StartClientSpan(ctx context.Context, serviceName, operationName string) (context.Context, tracespec.Trace) {
    // **1**
    if span, ok := ctx.Value(tracespec.TracingKey).(*Span); ok {
        // **2**
        return span.Fork(ctx, serviceName, operationName)
    }

    return ctx, emptyNoopSpan
}
```

1. Get the span context information brought down by the upstream
1. Create a new ctx from the acquired span, span "inherit the traceId of the parent span"
1. Add the span generated data to ctx, pass it to the next middleware, and flow downstream

## Summary

`go-zero` obtains the link traceID by intercepting the request, and then assigns a root Span at the entry of the middleware function, and then splits the child Spans in subsequent operations. Each span has its own specific identification. After Finsh Will be collected in the link tracking system. Developers can trace the traceID through the ELK tool to see the entire call chain.

At the same time, `go-zero` does not provide a complete set of `trace` link solutions. Developers can encapsulate the existing `span` structure of `go-zero`, build their own reporting system, and access links such as `jaeger, zipkin`, etc. Tracking tool.

## Reference

- [go-zero trace](https://github.com/zeromicro/go-zero/tree/master/core/trace)

# TraceHandler

微服务架构中，调用链可能很漫长，从 `http` 到 `rpc` ，又从 `rpc` 到 `http` 。而开发者想了解每个环节的调用情况及性能，最佳方案就是 **全链路跟踪**。

追踪的方法就是在一个请求开始时生成一个自己的 `spanID` ，随着整个请求链路传下去。我们则通过这个 `spanID` 查看整个链路的情况和性能问题。

下面来看看 `go-zero` 的链路实现。

## 代码结构


- [spancontext](https://github.com/zeromicro/go-zero/blob/master/core/trace/spancontext.go)：保存链路的上下文信息「traceid，spanid，或者是其他想要传递的内容」
- [span](https://github.com/zeromicro/go-zero/blob/master/core/trace/span.go)：链路中的一个操作，存储时间和某些信息
- [propagator](https://github.com/zeromicro/go-zero/blob/master/core/trace/propagator.go)： `trace` 传播下游的操作「抽取，注入」
- [noop](https://github.com/zeromicro/go-zero/blob/master/core/trace/noop.go)：实现了空的 `tracer` 实现



   ![image.png](https://cdn.nlark.com/yuque/0/2020/png/261626/1604328646741-19a3d3ff-1b57-4415-afdc-2fc2df082e98.png#align=left&display=inline&height=826&margin=%5Bobject%20Object%5D&name=image.png&originHeight=826&originWidth=1566&size=138270&status=done&style=none&width=1566)
## 概念


### SpanContext


在介绍 `span` 之前，先引入 `context` 。SpanContext 保存了分布式追踪的上下文信息，包括 Trace id，Span id 以及其它需要传递到下游的内容。OpenTracing 的实现需要将 SpanContext 通过某种协议 进行传递，以将不同进程中的 Span 关联到同一个 Trace 上。对于 HTTP 请求来说，SpanContext 一般是采用 HTTP header 进行传递的。

下面是 `go-zero` 默认实现的 `spanContext`

```go
type spanContext struct {
	traceId string		// TraceID 表示tracer的全局唯一ID
	spanId  string		// SpanId 标示单个trace中某一个span的唯一ID，在trace中唯一
}
```
同时开发者也可以实现 `SpanContext` 提供的接口方法，实现自己的上下文信息传递：
```go
type SpanContext interface {
	TraceId() string						// get TraceId
	SpanId() string							// get SpanId
	Visit(fn func(key, val string) bool)	// 自定义操作TraceId，SpanId
}
```
### Span


一个 REST 调用或者数据库操作等，都可以作为一个 `span` 。 `span` 是分布式追踪的最小跟踪单位，一个 Trace 由多段 Span 组成。追踪信息包含如下信息：

```go
type Span struct {
	ctx           spanContext		// 传递的上下文
	serviceName   string			// 服务名 
	operationName string			// 操作
	startTime     time.Time			// 开始时间戳
	flag          string			// 标记开启trace是 server 还是 client
	children      int				// 本 span fork出来的 childsnums
}
```


从 `span` 的定义结构来看：在微服务中， 这就是一个完整的子调用过程，有调用开始 `startTime` ，有标记自己唯一属性的上下文结构 `spanContext` 以及 fork 的子节点数。

## 实例应用


在 `go-zero` 中http，rpc中已经作为内置中间件集成。我们以 [http](https://github.com/zeromicro/go-zero/blob/master/rest/handler/tracinghandler.go)，[rpc](https://github.com/zeromico/go-zero/blob/master/zrpc/internal/clientinterceptors/tracinginterceptor.go) 中，看看 `tracing` 是怎么使用的：


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

1. 将 header -> carrier，获取 header 中的traceId等信息
1. 开启一个新的 span，并把**「traceId，spanId」**封装在context中
1. 从上述的 carrier「也就是header」获取traceId，spanId。
   1. 看header中是否设置
   1. 如果没有设置，则随机生成返回
4. 从 `request` 中产生新的ctx，并将相应的信息封装在 ctx 中，返回
4. 从上述的 context，拷贝一份到当前的 `request` 



![image.png](https://cdn.nlark.com/yuque/0/2020/png/261626/1604367893132-ced2aaa8-cb12-4461-bad8-e0ad2c275b56.png#align=left&display=inline&height=387&margin=%5Bobject%20Object%5D&name=image.png&originHeight=387&originWidth=792&size=25191&status=done&style=none&width=792)


这样就实现了 `span` 的信息随着 `request` 传递到下游服务。


### RPC


在 rpc 中存在 `client, server` ，所以从 `tracing` 上也有 `clientTracing, serverTracing` 。 `serveTracing` 的逻辑基本与 http 的一致，来看看 `clientTracing` 是怎么使用的？


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
    // **3** 将 pair 中的data以map的形式加入 ctx
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

1. 获取上游带下来的 span 上下文信息
1. 从获取的 span 中创建新的 ctx，span「继承父span的traceId」
1. 将生成 span 的data加入ctx，传递到下一个中间件，流至下游



## 总结


`go-zero` 通过拦截请求获取链路traceID，然后在中间件函数入口会分配一个根Span，然后在后续操作中会分裂出子Span，每个span都有自己的具体的标识，Finsh之后就会汇集在链路追踪系统中。

开发者可以通过 `ELK` 工具追踪 `traceID` ，看到整个调用链。同时 `go-zero` 并没有提供整套 `trace` 链路方案，开发者可以封装 `go-zero` 已有的 `span` 结构，做自己的上报系统，接入 `jaeger, zipkin` 等链路追踪工具。


## 参考


- [go-zero trace](https://github.com/zeromicro/go-zero/tree/master/core/trace)
- [https://zhuanlan.zhihu.com/p/34318538](https://zhuanlan.zhihu.com/p/34318538)



<Vssue title="traceHandler" />


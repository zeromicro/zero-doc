---
sidebar_position: 19
---

# zRPC使用介绍

近期比较火的开源项目[go-zero](https://github.com/zeromicro/go-zero)是一个集成了各种工程实践的包含了Web和RPC协议的功能完善的微服务框架，今天我们就一起来分析一下其中的RPC部分[zRPC](https://github.com/zeromicro/go-zero/tree/master/zrpc)。

zRPC底层依赖gRPC，内置了服务注册、负载均衡、拦截器等模块，其中还包括自适应降载，自适应熔断，限流等微服务治理方案，是一个简单易用的可直接用于生产的企业级RPC框架。

### zRPC初探

zRPC支持直连和基于etcd服务发现两种方式，我们以基于etcd做服务发现为例演示zRPC的基本使用：

##### 配置

创建hello.yaml配置文件，配置如下：

```yaml
Name: hello.rpc           // 服务名
ListenOn: 127.0.0.1:9090  // 服务监听地址
Etcd:
  Hosts:
    - 127.0.0.1:2379      // etcd服务地址
  Key: hello.rpc          // 服务注册key
```

##### 创建proto文件

创建hello.proto文件，并生成对应的go代码

```protobuf
syntax = "proto3";

package pb;

service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

message HelloRequest {
  string name = 1;
}

message HelloReply {
  string message = 1;
}
```

生成go代码

```go
protoc --go_out=plugins=grpc:. hello.proto
```

##### Server端

```go
package main

import (
    "context"
    "flag"
    "log"

    "example/zrpc/pb"

    "github.com/zeromicro/go-zero/core/conf"
    "github.com/zeromicro/go-zero/zrpc"
    "google.golang.org/grpc"
)

type Config struct {
    zrpc.RpcServerConf
}

var cfgFile = flag.String("f", "./hello.yaml", "cfg file")

func main() {
    flag.Parse()

    var cfg Config
    conf.MustLoad(*cfgFile, &cfg)

    srv, err := zrpc.NewServer(cfg.RpcServerConf, func(s *grpc.Server) {
        pb.RegisterGreeterServer(s, &Hello{})
    })
    if err != nil {
        log.Fatal(err)
    }
    srv.Start()
}

type Hello struct{}

func (h *Hello) SayHello(ctx context.Context, in *pb.HelloRequest) (*pb.HelloReply, error) {
    return &pb.HelloReply{Message: "hello " + in.Name}, nil
}
```

##### Client端

```go
package main

import (
    "context"
    "log"

    "example/zrpc/pb"

    "github.com/zeromicro/go-zero/core/discov"
    "github.com/zeromicro/go-zero/zrpc"
)

func main() {
    client := zrpc.MustNewClient(zrpc.RpcClientConf{
        Etcd: discov.EtcdConf{
            Hosts: []string{"127.0.0.1:2379"},
            Key:   "hello.rpc",
        },
    })

    conn := client.Conn()
    hello := pb.NewGreeterClient(conn)
    reply, err := hello.SayHello(context.Background(), &pb.HelloRequest{Name: "go-zero"})
    if err != nil {
        log.Fatal(err)
    }
    log.Println(reply.Message)
}
```

启动服务，查看服务是否注册：

```go
ETCDCTL_API=3 etcdctl get hello.rpc --prefix
```

显示服务已经注册：

```go
hello.rpc/7587849401504590084
127.0.0.1:9090
```

运行客户端即可看到输出：

```go
hello go-zero
```

这个例子演示了zRPC的基本使用，可以看到通过zRPC构建RPC服务非常简单，只需要很少的几行代码，接下来我们继续进行探索

### zRPC原理分析

下图展示zRPC的架构图和主要组成部分

![zrpc](https://gitee.com/kevwan/static/raw/master/doc/images/zrpc.png)

zRPC主要有以下几个模块组成：

- discov: 服务发现模块，基于etcd实现服务发现功能
- resolver: 服务注册模块，实现了gRPC的resolver.Builder接口并注册到gRPC
- interceptor: 拦截器，对请求和响应进行拦截处理
- balancer: 负载均衡模块，实现了p2c负载均衡算法，并注册到gRPC 
- client: zRPC客户端，负责发起请求
- server: zRPC服务端，负责处理请求 

这里介绍了zRPC的主要组成模块和每个模块的主要功能，其中resolver和balancer模块实现了gRPC开放的接口，实现了自定义的resolver和balancer，拦截器模块是整个zRPC的功能重点，自适应降载、自适应熔断、prometheus服务指标收集等功能都在这里实现



### Interceptor模块

gRPC提供了拦截器功能，主要是对请求前后进行额外处理的拦截操作，其中拦截器包含客户端拦截器和服务端拦截器，又分为一元(Unary)拦截器和流(Stream)拦截器，这里我们主要讲解一元拦截器，流拦截器同理。

![interceptor](https://gitee.com/kevwan/static/raw/master/doc/images/interceptor.png)

客户端拦截器定义如下:

```go
type UnaryClientInterceptor func(ctx context.Context, method string, req, reply interface{}, cc *ClientConn, invoker UnaryInvoker, opts ...CallOption) error
```

其中method为方法名，req，reply分别为请求和响应参数，cc为客户端连接对象，invoker参数是真正执行rpc方法的handler其实在拦截器中被调用执行

服务端拦截器定义如下:

```go
type UnaryServerInterceptor func(ctx context.Context, req interface{}, info *UnaryServerInfo, handler UnaryHandler) (resp interface{}, err error)
```

其中req为请求参数，info中包含了请求方法属性，handler为对server端方法的包装，也是在拦截器中被调用执行

zRPC中内置了丰富的拦截器，其中包括自适应降载、自适应熔断、权限验证、prometheus指标收集等等，由于拦截器较多，篇幅有限没法所有的拦截器给大家一一解析，这里我们主要分析两个，自适应熔断和prometheus服务监控指标收集：

#### 内置拦截器分析

##### 自适应熔断(breaker)

当客户端向服务端发起请求，客户端会记录服务端返回的错误，当错误达到一定的比例，客户端会自行的进行熔断处理，丢弃掉一定比例的请求以保护下游依赖，且可以自动恢复。zRPC中自适应熔断遵循[《Google SRE》](https://landing.google.com/sre/sre-book/chapters/handling-overload)中过载保护策略，算法如下：

<img src="/Users/zhoushuguang/Documents/工作/go-zero文档/overload.png" alt="overload"/>

requests: 总请求数量

accepts: 正常请求数量 

K: 倍值 (Google SRE推荐值为2)

可以通过修改K的值来修改熔断发生的激进程度，降低K的值会使得自适应熔断算法更加激进，增加K的值则自适应熔断算法变得不再那么激进

[熔断拦截器](https://github.com/zeromicro/go-zero/blob/master/zrpc/internal/clientinterceptors/breakerinterceptor.go)定义如下：

```go
func BreakerInterceptor(ctx context.Context, method string, req, reply interface{},
	cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
  // target + 方法名
	breakerName := path.Join(cc.Target(), method)
	return breaker.DoWithAcceptable(breakerName, func() error {
    // 真正执行调用
		return invoker(ctx, method, req, reply, cc, opts...)
	}, codes.Acceptable)
}
```

accept方法实现了Google SRE过载保护算法，判断否进行熔断

```go
func (b *googleBreaker) accept() error {
	 // accepts为正常请求数，total为总请求数
   accepts, total := b.history()
   weightedAccepts := b.k * float64(accepts)
   // 算法实现
   dropRatio := math.Max(0, (float64(total-protection)-weightedAccepts)/float64(total+1))
   if dropRatio <= 0 {
      return nil
   }
	 // 是否超过比例
   if b.proba.TrueOnProba(dropRatio) {
      return ErrServiceUnavailable
   }

   return nil
}
```

doReq方法首先判断是否熔断，满足条件直接返回error(circuit breaker is open)，不满足条件则对请求数进行累加

```go
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
	
   // 此处执行RPC请求
   err := req()
   // 正常请求total和accepts都会加1
   if acceptable(err) {
      b.markSuccess()
   } else {
     // 请求失败只有total会加1
      b.markFailure()
   }

   return err
}
```

##### prometheus指标收集

服务监控是了解服务当前运行状态以及变化趋势的重要手段，监控依赖于服务指标的收集，通过prometheus进行监控指标的收集是业界主流方案，zRPC中也采用了prometheus来进行指标的收集

[prometheus拦截器](https://github.com/zeromicro/go-zero/blob/master/zrpc/internal/serverinterceptors/prometheusinterceptor.go)定义如下：

这个拦截器主要是对服务的监控指标进行收集，这里主要是对RPC方法的耗时和调用错误进行收集，这里主要使用了Prometheus的Histogram和Counter数据类型

```go
func UnaryPrometheusInterceptor() grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (
		interface{}, error) {
    // 执行前记录一个时间
		startTime := timex.Now()
		resp, err := handler(ctx, req)
    // 执行后通过Since算出执行该调用的耗时
		metricServerReqDur.Observe(int64(timex.Since(startTime)/time.Millisecond), info.FullMethod)
    // 方法对应的错误码
		metricServerReqCodeTotal.Inc(info.FullMethod, strconv.Itoa(int(status.Code(err))))
		return resp, err
	}
}
```

#### 添加自定义拦截器

除了内置了丰富的拦截器之外，zRPC同时支持添加自定义拦截器

Client端通过AddInterceptor方法添加一元拦截器：

```go
func (rc *RpcClient) AddInterceptor(interceptor grpc.UnaryClientInterceptor) {
	rc.client.AddInterceptor(interceptor)
}
```

Server端通过AddUnaryInterceptors方法添加一元拦截器：

```go
func (rs *RpcServer) AddUnaryInterceptors(interceptors ...grpc.UnaryServerInterceptor) {
	rs.server.AddUnaryInterceptors(interceptors...)
}
```

### resolver模块

zRPC服务注册架构图：

![resolver](https://gitee.com/kevwan/static/raw/master/doc/images/resolver.png)

zRPC中自定义了resolver模块，用来实现服务的注册功能。zRPC底层依赖gRPC，在gRPC中要想自定义resolver需要实现resolver.Builder接口：

```go
type Builder interface {
	Build(target Target, cc ClientConn, opts BuildOptions) (Resolver, error)
	Scheme() string
}
```

其中Build方法返回Resolver，Resolver定义如下：

```go
type Resolver interface {
	ResolveNow(ResolveNowOptions)
	Close()
}
```

在zRPC中定义了两种resolver，direct和discov，这里我们主要分析基于etcd做服务发现的discov，自定义的resolver需要通过gRPC提供了Register方法进行注册代码如下：

```go
func RegisterResolver() {
	resolver.Register(&dirBuilder)
	resolver.Register(&disBuilder)
}
```

当我们启动我们的zRPC Server的时候，调用Start方法，会像etcd中注册对应的服务地址：

```go
func (ags keepAliveServer) Start(fn RegisterFn) error {
  // 注册服务地址
	if err := ags.registerEtcd(); err != nil {
		return err
	}
	// 启动服务
	return ags.Server.Start(fn)
}
```

当我们启动zRPC客户端的时候，在gRPC内部会调用我们自定义resolver的Build方法，zRPC通过在Build方法内调用执行了resolver.ClientConn的UpdateState方法，该方法会把服务地址注册到gRPC客户端内部：

```go
func (d *discovBuilder) Build(target resolver.Target, cc resolver.ClientConn, opts resolver.BuildOptions) (
	resolver.Resolver, error) {
	hosts := strings.FieldsFunc(target.Authority, func(r rune) bool {
		return r == EndpointSepChar
	})
  // 服务发现
	sub, err := discov.NewSubscriber(hosts, target.Endpoint)
	if err != nil {
		return nil, err
	}

	update := func() {
		var addrs []resolver.Address
		for _, val := range subset(sub.Values(), subsetSize) {
			addrs = append(addrs, resolver.Address{
				Addr: val,
			})
		}
    // 向gRPC注册服务地址
		cc.UpdateState(resolver.State{
			Addresses: addrs,
		})
	}
  // 监听
	sub.AddListener(update)
	update()
	// 返回自定义的resolver.Resolver
	return &nopResolver{cc: cc}, nil
}
```

在discov中，通过调用load方法从etcd中获取指定服务的所有地址：

```go
func (c *cluster) load(cli EtcdClient, key string) {
	var resp *clientv3.GetResponse
	for {
		var err error
		ctx, cancel := context.WithTimeout(c.context(cli), RequestTimeout)
    // 从etcd中获取指定服务的所有地址
		resp, err = cli.Get(ctx, makeKeyPrefix(key), clientv3.WithPrefix())
		cancel()
		if err == nil {
			break
		}

		logx.Error(err)
		time.Sleep(coolDownInterval)
	}

	var kvs []KV
	c.lock.Lock()
	for _, ev := range resp.Kvs {
		kvs = append(kvs, KV{
			Key: string(ev.Key),
			Val: string(ev.Value),
		})
	}
	c.lock.Unlock()

	c.handleChanges(key, kvs)
}
```

并通过watch监听服务地址的变化：

```go
func (c *cluster) watch(cli EtcdClient, key string) {
	rch := cli.Watch(clientv3.WithRequireLeader(c.context(cli)), makeKeyPrefix(key), clientv3.WithPrefix())
	for {
		select {
		case wresp, ok := <-rch:
			if !ok {
				logx.Error("etcd monitor chan has been closed")
				return
			}
			if wresp.Canceled {
				logx.Error("etcd monitor chan has been canceled")
				return
			}
			if wresp.Err() != nil {
				logx.Error(fmt.Sprintf("etcd monitor chan error: %v", wresp.Err()))
				return
			}
			// 监听变化通知更新
			c.handleWatchEvents(key, wresp.Events)
		case <-c.done:
			return
		}
	}
}
```

这部分主要介绍了zRPC中是如何自定义的resolver，以及基于etcd的服务发现原理，通过这部分的介绍大家可以了解到zRPC内部服务注册发现的原理，源代码比较多只是粗略的从整个流程上进行了分析，如果大家对zRPC的源码比较感兴趣可以自行进行学习

### balancer模块

负载均衡原理图：


避免过载是负载均衡策略的一个重要指标，好的负载均衡算法能很好的平衡服务端资源。常用的负载均衡算法有轮训、随机、Hash、加权轮训等。但为了应对各种复杂的场景，简单的负载均衡算法往往表现的不够好，比如轮训算法当服务响应时间变长就很容易导致负载不再平衡， 因此zRPC中自定义了默认负载均衡算法P2C(Power of Two Choices)，和resolver类似，要想自定义balancer也需要实现gRPC定义的balancer.Builder接口，由于和resolver类似这里不再带大家一起分析如何自定义balancer，感兴趣的朋友可以查看gRPC相关的文档来进行学习

注意，zRPC是在客户端进行负载均衡，常见的还有通过nginx中间代理的方式

zRPC框架中默认的负载均衡算法为P2C，该算法的主要思想是：

1. 从可用节点列表中做两次随机选择操作，得到节点A、B
2. 比较A、B两个节点，选出负载最低的节点作为被选中的节点

伪代码如下：

<img src="https://gitee.com/kevwan/static/raw/master/doc/images/random_pseudo.png" alt="random_pseudo" />

主要算法逻辑在Pick方法中实现：

```go
func (p *p2cPicker) Pick(ctx context.Context, info balancer.PickInfo) (
	conn balancer.SubConn, done func(balancer.DoneInfo), err error) {
	p.lock.Lock()
	defer p.lock.Unlock()

	var chosen *subConn
	switch len(p.conns) {
	case 0:
		return nil, nil, balancer.ErrNoSubConnAvailable
	case 1:
		chosen = p.choose(p.conns[0], nil)
	case 2:
		chosen = p.choose(p.conns[0], p.conns[1])
	default:
		var node1, node2 *subConn
		for i := 0; i < pickTimes; i++ {
      // 随机数
			a := p.r.Intn(len(p.conns))
			b := p.r.Intn(len(p.conns) - 1)
			if b >= a {
				b++
			}
      // 随机获取所有节点中的两个节点
			node1 = p.conns[a]
			node2 = p.conns[b]
      // 效验节点是否健康
			if node1.healthy() && node2.healthy() {
				break
			}
		}
		// 选择其中一个节点
		chosen = p.choose(node1, node2)
	}

	atomic.AddInt64(&chosen.inflight, 1)
	atomic.AddInt64(&chosen.requests, 1)
	return chosen.conn, p.buildDoneFunc(chosen), nil
}
```

choose方法对随机选择出来的节点进行负载比较从而最终确定选择哪个节点

```go
func (p *p2cPicker) choose(c1, c2 *subConn) *subConn {
	start := int64(timex.Now())
	if c2 == nil {
		atomic.StoreInt64(&c1.pick, start)
		return c1
	}

	if c1.load() > c2.load() {
		c1, c2 = c2, c1
	}

	pick := atomic.LoadInt64(&c2.pick)
	if start-pick > forcePick && atomic.CompareAndSwapInt64(&c2.pick, pick, start) {
		return c2
	} else {
		atomic.StoreInt64(&c1.pick, start)
		return c1
	}
}
```

上面主要介绍了zRPC默认负载均衡算法的设计思想和代码实现，那自定义的balancer是如何注册到gRPC的呢，resolver提供了Register方法来进行注册，同样balancer也提供了Register方法来进行注册：

```go
func init() {
	balancer.Register(newBuilder())
}

func newBuilder() balancer.Builder {
	return base.NewBalancerBuilder(Name, new(p2cPickerBuilder))
}
```

注册balancer之后gRPC怎么知道使用哪个balancer呢？这里我们需要使用配置项进行配置，在NewClient的时候通过grpc.WithBalancerName方法进行配置：

```go
func NewClient(target string, opts ...ClientOption) (*client, error) {
	var cli client
	opts = append(opts, WithDialOption(grpc.WithBalancerName(p2c.Name)))
	if err := cli.dial(target, opts...); err != nil {
		return nil, err
	}

	return &cli, nil
}
```

这部分主要介绍了zRPC中内中的负载均衡算法的实现原理以及具体的实现方式，之后介绍了zRPC是如何注册自定义的balancer以及如何选择自定义的balancer，通过这部分大家应该对负载均衡有了更进一步的认识

### 总结

首先，介绍了zRPC的基本使用方法，可以看到zRPC使用非常简单，只需要少数几行代码就可以构建高性能和自带服务治理能力的RPC服务，当然这里没有面面俱到的介绍zRPC的基本使用，大家可以查看相关文档进行学习

接着，介绍了zRPC的几个重要组成模块以及其实现原理，并分析了部分源码。拦截器模块是整个zRPC的重点，其中内置了丰富的功能，像熔断、监控、降载等等也是构建高可用微服务必不可少的。resolver和balancer模块自定义了gRPC的resolver和balancer，通过该部分可以了解到整个服务注册与发现的原理以及如何构建自己的服务发现系统，同时自定义负载均衡算法也变得不再神秘

最后，zRPC是一个经历过各种工程实践的RPC框架，不论是想要用于生产还是学习其中的设计模式都是一个不可多得的开源项目。希望通过这篇文章的介绍大家能够进一步了解zRPC



### 





---
sidebar_position: 1
---

# rest

### 概述

从日常开发经验来说，一个好的 web 框架大致需要满足以下特性：

* 路由匹配/多路由支持
* 支持自定义中间件
* 框架和业务开发完全解耦，方便开发者快速开发
* 参数校验/匹配
* 监控/日志/指标等服务自查功能
* 服务自保护(熔断/限流)

### rest概览

rest有如下特点：

* 借助 `context` (不同于 `gin` 的 `context`)，将资源初始化好 → 保存在 `serviveCtx` 中，在 `handler` 中共享（至于资源池化，交给资源自己处理，`serviveCtx` 只是入口和共享点）
* 独立 router 声明文件，同时加入 router group 的概念，方便开发者整理代码结构
* 内置若干中间件：监控/熔断/鉴权等
* 利用 goctl codegen + option 设计模式，方便开发者自己控制部分中间件的接入

下图描述了 rest 处理请求的模式和大部分处理路径。

* 框架内置的中间件已经帮开发者解决了大部分服务自处理的逻辑
* 同时 go-zero 在 business logic 处也给予开发者开箱即用的组件(dq、fx 等)
* 从开发模式上帮助开发者只需要关注自己的 business logic 以及所需资源准备

![rest](/img/rest.png)

### 启动流程

下图描述了整体 server 启动经过的模块和大致流程。准备按照如下流程分析 rest 实现：

* 基于 http.server 封装以及改造：把 engine(web框架核心) 和 option 隔离开
* 多路由匹配采取 radix-tree 构造
* 中间件采用洋葱模型 → []Middleware
* http parse 解析以及匹配校验 → httpx.Parse()
* 在请求过程会收集指标 (createMetrics()) 以及监控埋点 (prometheus)

![rest_start](/img/rest_start.png)

#### server engine

engine 贯穿整个 server 生命周期中：

* router 会携带开发者定义的 path/handler，会在最后的 router.handle() 执行
* 注册的自定义中间件 + 框架中间件，在 router handler logic 前执行

在这里：go-zero 处理的粒度在 route 上，封装和处理都在 route 一层层执行

![server_engine](/img/server_engine.jpeg)

### 路由匹配

那么当 request 到来，首先是如何到路由这一层的？

首先在开发最原始的 http server ，都有这么一段代码：

![basic_server](/img/basic_server.png)

`http.ListenAndServe()`  内部会执行到：`server.ListenAndServe()`

我们看看在 rest 里面是怎么运用的：

![rest_route](/img/rest_route.png)

而传入的 handler 其实就是：router.NewRouter() 生成的 router。这个 router 承载了整个 server 的处理函数集合。

同时 http.Server 结构在初始化时，是把 handler 注入到里面的：

![rest_route](/img/rest_handle.png)

在 http.Server 接收 req 后，最终执行的也是：`handler.ServeHTTP(rw, req)`

![rest_route](/img/servehttp.png)

所以内置的 `router` 也需要实现 `ServeHTTP` 。至于 `router` 自己是怎么实现 `ServeHTTP` :无外乎就是寻找匹配路由，然后执行路由对应的 `handle logic`。

### 解析参数

解析参数是 http 框架需要提供的基本能力。在 goctl code gen 生成的代码中，handler 层已经集成了 req argument parse 函数：

![rest_route](/img/rest_parse.png)

进入到 `httpx.Parse()` ，主要解析以下几块：

```go title="https://github.com/zeromicro/go-zero/blob/master/rest/httpx/requests.go#L32:6"
```

* 解析path
* 解析form表单
* 解析http header
* 解析json

:::info

Parse() 中的 参数校验 的功能见：

https://go-zero.dev/cn/api-grammar.html 中的 tag修饰符

:::

### 使用示例

[使用示例](https://github.com/zeromicro/zero-examples/tree/main/http)

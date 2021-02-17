# 简介

### 介绍
zRPC是经过生产环境千万日活实践检验的通用RPC框架，其底层依赖gRPC，内置完整的微服务治理能力。是一款简单、通用、高性能、可扩展的RPC框架

### 框架特点

- 通用性：依赖gRPC，支持跨语言的调用
- 高性能：底层依赖HTTP2协议，序列化采用Protobuf序列化，保证了高性能
- 可扩展：用户可根据不同的业务特点扩展功能如自定义拦截器等等
- 功能完整：内建服务治理功能无需做任何配置,主要包括鉴权、日志记录、监控报警、数据统计、链路追踪、超时控制、自动熔断、自动降载等等，同时内置服务注册，服务发现，负载均衡等功能
- 简单高效：只需几行代码即可创建服务，同时可配合goctl工具代码自动生成，用户只需要关注业务代码



### 优势

- 轻松获得支撑千万日活服务的稳定性
- 内建级联超时控制、限流、自适应熔断、自适应降载等微服务治理能力，无需配置和额外代码
- 微服务治理中间件可无缝集成到其它现有框架使用
- 大量微服务治理和并发工具包



### 架构
![zrpc_architecture.png](https://cdn.nlark.com/yuque/0/2020/png/1220818/1603421072381-3bbade3c-3fa4-4f9c-8e89-0fc5a838cfa5.png#align=left&display=inline&height=1214&margin=%5Bobject%20Object%5D&name=zrpc_architecture.png&originHeight=1214&originWidth=1860&size=145068&status=done&style=none&width=1860)


<Vssue title="zrpcinfo" />


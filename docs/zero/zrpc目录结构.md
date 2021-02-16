# 目录结构

### zRPC目录结构
```
zrpc
├── internal
│   ├── auth
│   │   ├── auth.go                       // 基于Redis的身份验证器
│   │   ├── auth_test.go
│   │   ├── credential.go                 // 证书及相关方法
│   │   ├── credential_test.go
│   │   └── vars.go
│   ├── balancer
│   │   └── p2c 
│   │       ├── p2c.go                    // p2c负载均衡
│   │       └── p2c_test.go								// https://www.nginx.com/blog/nginx-power-of-two-choices-load-balancing-algorithm/
│   ├── clientinterceptors                // 客户端拦截器
│   │   ├── breakerinterceptor.go
│   │   ├── breakerinterceptor_test.go
│   │   ├── durationinterceptor.go
│   │   ├── durationinterceptor_test.go
│   │   ├── prometheusinterceptor.go
│   │   ├── prometheusinterceptor_test.go
│   │   ├── timeoutinterceptor.go
│   │   ├── timeoutinterceptor_test.go
│   │   ├── tracinginterceptor.go
│   │   └── tracinginterceptor_test.go
│   ├── serverinterceptors                   // 服务端拦截器
│   │   ├── authinterceptor.go
│   │   ├── authinterceptor_test.go
│   │   ├── crashinterceptor.go
│   │   ├── crashinterceptor_test.go
│   │   ├── prometheusinterceptor.go
│   │   ├── prometheusinterceptor_test.go
│   │   ├── sheddinginterceptor.go
│   │   ├── sheddinginterceptor_test.go
│   │   ├── statinterceptor.go
│   │   ├── statinterceptor_test.go
│   │   ├── timeoutinterceptor.go
│   │   ├── timeoutinterceptor_test.go
│   │   ├── tracinginterceptor.go
│   │   └── tracinginterceptor_test.go
│   ├── codes
│   │   ├── accept.go
│   │   └── accept_test.go
│   ├── mock
│   │   ├── deposit.pb.go
│   │   ├── deposit.proto
│   │   └── depositserver.go
│   ├── resolver
│   │   ├── directbuilder.go                 // grpc中builder实例化
│   │   ├── directbuilder_test.go
│   │   ├── discovbuilder.go                 // grpc中builder实例化
│   │   ├── resolver.go                      // grpc中resolver实例化
│   │   ├── resolver_test.go
│   │   ├── subset.go                        // 随机子集
│   │   └── subset_test.go       
│   ├── client.go                            // zrpc客户端抽象
│   ├── client_test.go
│   ├── server.go                            // zrpc服务端抽象
│   ├── server_test.go                
│   ├── rpclogger.go
│   ├── rpcpubserver.go                      // 服务发现服务端实例
│   ├── rpcserver.go										     // 直连服务端服务端实例
│   ├── rpcserver_test.go
│   ├── chainclientinterceptors.go
│   ├── chainclientinterceptors_test.go
│   ├── chainserverinterceptors.go
│   ├── chainserverinterceptors_test.go
│   ├── target.go    // 构建rpc地址方法
│   └── target_test.go
├── client.go        // zrpc客户端实例
├── client_test.go
├── config.go        // zrpc服务端&客户端配置
├── config_test.go
├── proxy.go
├── proxy_test.go    
└── server.go        // zrpc服务端实例
```
zRPC的核心功能主要在internal目录下：
auth：该模块主要实现鉴权功能
balancer：该模块主要是负载均衡的实现，内置默认p2c负载均衡算法
clientinterceptors: 客户通用端拦截器，内置熔断、统计、指标收集等功能
resolver：自定义resolver做服务注册，实现gRPC的resolver接口
serverinterceptors：服务端通用拦截器，内置鉴权、降载、监控指标收集、统计等功能


<Vssue title="zrpcstructure" />

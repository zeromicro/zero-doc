---
sidebar_position: 3
---

# 配置介绍

在正式使用go-zero之前，让我们先来了解一下go-zero中不同服务类型的配置定义，看看配置中每个字段分别有什么作用

## api配置
api配置控制着api服务中的各种功能，包含但不限于服务监听地址，端口，环境配置，日志配置等，下面我们从一个简单的配置来看一下api中常用配置分别有什么作用。

### 配置说明
通过yaml配置我们会发现，有很多参数我们并没有与config对齐，这是因为config定义中，有很多都是带`optional`或者`default`
标签的，对于`optional`可选项，你可以根据自己需求判断是否需要设置，对于`default`标签，如果你觉得默认值就已经够了，可以不用设置，
一般`default`中的值基本不用修改，可以认为是最佳实践值。

#### Config

```go
type Config struct{
    rest.RestConf // rest api配置
    Auth struct { // jwt鉴权配置
        AccessSecret string // jwt密钥
        AccessExpire int64 // 有效期，单位：秒
    }
    Mysql struct { // 数据库配置，除mysql外，可能还有mongo等其他数据库
        DataSource string // mysql链接地址，满足 $user:$password@tcp($ip:$port)/$db?$queries 格式即可
    }
    CacheRedis cache.CacheConf // redis缓存
    UserRpc    zrpc.RpcClientConf // rpc client配置
}    
```

#### rest.RestConf
api服务基础配置，包含监听地址，监听端口，证书配置，限流，熔断参数，超时参数等控制，对其展开我们可以看到：
```go
service.ServiceConf // service配置
Host     string `json:",default=0.0.0.0"` // http监听ip，默认0.0.0.0
Port     int // http监听端口,必填
CertFile string `json:",optional"` // https证书文件，可选
KeyFile  string `json:",optional"` // https私钥文件，可选 
Verbose  bool   `json:",optional"` // 是否打印详细http请求日志
MaxConns int    `json:",default=10000"` // http同时可接受最大请求数（限流数），默认10000
MaxBytes int64  `json:",default=1048576,range=[0:8388608]"` // http可接受请求的最大ContentLength，默认1048576，被设置值不能必须在0到8388608之间
// milliseconds
Timeout      int64         `json:",default=3000"` // 超时时长控制，单位：毫秒，默认3000
CpuThreshold int64         `json:",default=900,range=[0:1000]"` // cpu降载阈值，默认900，可允许设置范围0到1000
Signature    SignatureConf `json:",optional"` // 签名配置
```

#### service.ServiceConf
```go
type ServiceConf struct {
    Name       string // 服务名称
    Log        logx.LogConf // 日志配置
    Mode       string            `json:",default=pro,options=dev|test|pre|pro"` // 服务环境，dev-开发环境，test-测试环境，pre-预发环境，pro-正式环境
    MetricsUrl string            `json:",optional"` // 指标上报接口地址，该地址需要支持post json即可
    Prometheus prometheus.Config `json:",optional"` // prometheus配置
}
```

#### logx.LogConf
```go
type LogConf struct {
	ServiceName         string `json:",optional"` // 服务名称
	Mode                string `json:",default=console,options=console|file|volume"` // 日志模式，console-输出到console，file-输出到当前服务器（容器）文件，，volume-输出docker挂在文件内
	Path                string `json:",default=logs"` // 日志存储路径
	Level               string `json:",default=info,options=info|error|severe"` // 日志级别
	Compress            bool   `json:",optional"` // 是否开启gzip压缩
	KeepDays            int    `json:",optional"` // 日志保留天数
	StackCooldownMillis int    `json:",default=100"` // 日志write间隔
}
```

#### prometheus.Config
```go
type Config struct {
	Host string `json:",optional"` // prometheus 监听host
	Port int    `json:",default=9101"` // prometheus 监听端口
	Path string `json:",default=/metrics"` // 上报地址
}
```

#### SignatureConf
```go
SignatureConf struct {
    Strict      bool          `json:",default=false"` // 是否Strict模式，如果是则PrivateKeys必填
    Expiry      time.Duration `json:",default=1h"` // 有效期，默认1小时
    PrivateKeys []PrivateKeyConf // 签名密钥相关配置
}
```

#### PrivateKeyConf
```go
PrivateKeyConf struct {
    Fingerprint string // 指纹配置
    KeyFile     string // 密钥配置
}
```

#### cache.CacheConf
```go
ClusterConf []NodeConf

NodeConf struct {
    redis.RedisConf
    Weight int `json:",default=100"` // 权重
}
```

#### redis.RedisConf
```go
RedisConf struct {
    Host string // redis地址
    Type string `json:",default=node,options=node|cluster"` // redis类型
    Pass string `json:",optional"` // redis密码
}
```

## rpc配置

rpc配置控制着一个rpc服务的各种功能，包含但不限于监听地址，etcd配置，超时，熔断配置等，下面我们以一个常见的rpc服务配置来进行说明。

### 配置说明
```go
Config struct {
    zrpc.RpcServerConf
    CacheRedis         cache.CacheConf // redis缓存配置，详情见api配置说明，这里不赘述
    Mysql struct { // mysql数据库访问配置，详情见api配置说明，这里不赘述
        DataSource string
    }
}
```

#### zrpc.RpcServerConf
```go
RpcServerConf struct {
    service.ServiceConf // 服务配置，详情见api配置说明，这里不赘述
    ListenOn      string // rpc监听地址和端口，如：127.0.0.1:8888
    Etcd          discov.EtcdConf    `json:",optional"` // etcd相关配置
    Auth          bool               `json:",optional"` // 是否开启Auth，如果是则Redis为必填
    Redis         redis.RedisKeyConf `json:",optional"` // Auth验证
    StrictControl bool               `json:",optional"` // 是否Strict模式，如果是则遇到错误是Auth失败，否则可以认为成功
    // pending forever is not allowed
    // never set it to 0, if zero, the underlying will set to 2s automatically
    Timeout      int64 `json:",default=2000"` // 超时控制，单位：毫秒
    CpuThreshold int64 `json:",default=900,range=[0:1000]"` cpu降载阈值，默认900，可允许设置范围0到1000
}
```

#### discov.EtcdConf
```go
type EtcdConf struct {
	Hosts []string // etcd host数组
	Key   string // rpc注册key
}
```

#### redis.RedisKeyConf
```go
RedisConf struct {
    Host string // redis 主机
    Type string `json:",default=node,options=node|cluster"` // redis类型
    Pass string `json:",optional"` // redis密码
}

RedisKeyConf struct {
    RedisConf
    Key string `json:",optional"` // 验证key
}
```

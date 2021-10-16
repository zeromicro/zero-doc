# rpc配置

rpc配置控制着一个rpc服务的各种功能，包含但不限于监听地址，etcd配置，超时，熔断配置等，下面我们以一个常见的rpc服务配置来进行说明。

## 配置说明
```go
Config struct {
    zrpc.RpcServerConf
    CacheRedis         cache.CacheConf // redis缓存配置，详情见api配置说明，这里不赘述
    Mysql struct { // mysql数据库访问配置，详情见api配置说明，这里不赘述
        DataSource string
    }
}
```

### zrpc.RpcServerConf
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

### discov.EtcdConf
```go
type EtcdConf struct {
	Hosts []string // etcd host数组
	Key   string // rpc注册key
}
```

### redis.RedisKeyConf
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

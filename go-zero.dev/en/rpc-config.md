# RPC Configuration
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)


The rpc configuration controls various functions of an rpc service, including but not limited to listening address, etcd configuration, timeout, fuse configuration, etc. Below we will use a common rpc service configuration to illustrate.

## Configuration instructions
```go
Config struct {
    zrpc.RpcServerConf
    CacheRedis         cache.CacheConf // Redis cache configuration, see the api configuration instructions for details, and I won’t go into details here
    Mysql struct { // mysql database access configuration, see api configuration instructions for details, not repeat here
        DataSource string
    }
}
```

### zrpc.RpcServerConf
```go
RpcServerConf struct {
    service.ServiceConf // mysql database access configuration, see api configuration instructions for details, not repeat here
    ListenOn      string // rpc listening address and port, such as: 127.0.0.1:8888
    Etcd          discov.EtcdConf    `json:",optional"` // etcd related configuration
    Auth          bool               `json:",optional"` // Whether to enable Auth, if yes, Redis is required
    Redis         redis.RedisKeyConf `json:",optional"` // Auth verification
    StrictControl bool               `json:",optional"` // Whether it is Strict mode, if it is, the error is Auth failure, otherwise it can be considered as successful
    // pending forever is not allowed
    // never set it to 0, if zero, the underlying will set to 2s automatically
    Timeout      int64 `json:",default=2000"` // Timeout control, unit: milliseconds
    CpuThreshold int64 `json:",default=900,range=[0:1000]"` // CPU load reduction threshold, the default is 900, the allowable setting range is 0 to 1000
}
```

### discov.EtcdConf
```go
type EtcdConf struct {
	Hosts []string // etcd host array
	Key   string // rpc registration key
}
```

### redis.RedisKeyConf
```go
RedisConf struct {
    Host string // redis host
    Type string `json:",default=node,options=node|cluster"` // redis type
    Pass string `json:",optional"` // redis password
}

RedisKeyConf struct {
    RedisConf
    Key string `json:",optional"` // Verification key
}
```

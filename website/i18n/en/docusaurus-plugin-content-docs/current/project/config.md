---
sidebar_position: 3
---

# Configuration introduction

Before we officially use go-zero, let's take a look at the configuration definitions for the different service types in go-zero and see what each of the fields in the configuration does

## api configuration
The api configuration controls various functions in the api service, including but not limited to service listener address, port, environment configuration, logging configuration, etc. Let's take a look at a simple configuration to see what the common configurations in api do respectively.

### Configuration description
Through the yaml configuration we will find that there are many parameters we do not align with the config, this is because the config definition, there are many are with `optional` or `default`
For the `optional` option, you can determine whether you need to set it according to your needs, for the `default` tag, if you think the default value is enough, you can not set.
Generally, the value in `default` does not need to be modified and can be considered as the best practice value.

#### Config

```go
type Config struct{
    RestConf // rest api configuration
    Auth struct { // jwt authentication configuration
        AccessSecret string // jwt key
        AccessExpire int64 // expiration date in seconds
    Mysql struct { // database}
    Mysql struct { // database configuration, in addition to mysql, there may be other databases such as mongo
        DataSource string // mysql link address, meet $user:$password@tcp($ip:$port)/$db?$queries format can be
    }
    CacheRedis cache.CacheConf // redis cache
    UserRpc zrpc.RpcClientConf // rpc client configuration
}    
```

#### rest.RestConf
api service base configuration, including listening address, listening port, certificate configuration, flow limit, fuse parameters, timeout parameters and other controls, to which we can expand to see.
```go
ServiceConf // service configuration
Host string `json:",default=0.0.0.0"` // http listening ip, default 0.0.0.0
Port int // http listening port, required
CertFile string `json:",optional"` // https certificate file, optional
KeyFile string `json:",optional"` // https private key file, optional 
Verbose bool `json:",optional"` // Whether to print detailed http request logs
MaxConns int `json:",default=10000"` // Maximum number of requests that can be accepted at the same time by http (limited number of streams), default 10000
MaxBytes int64 `json:",default=1048576,range=[0:8388608]"` // The maximum ContentLength of http requests that can be accepted, default 1048576, the set value must not be between 0 and 8388608
// milliseconds
Timeout int64 `json:",default=3000"` // Timeout duration control, unit: milliseconds, default 3000
CpuThreshold int64 `json:",default=900,range=[0:1000]"` // cpu down load threshold, default 900, allowable range 0 to 1000
Signature SignatureConf `json:",optional"` // signature configuration
```

#### service.ServiceConf
```go
type ServiceConf struct {
    Name string // Service name
    Log logx.LogConf // Logging configuration
    Mode string ``json:",default=pro,options=dev|test|pre|pro"` // Service environment, dev-development environment, test-test environment, pre-pre-release environment, pro-formal environment
    MetricsUrl string `json:",optional"` // The address of the metrics reporting interface, which needs to support post json
    Prometheus prometheus.Config `json:",optional"` // prometheus configuration
}
```

#### logx.LogConf
```go
type LogConf struct {
	ServiceName string `json:",optional"` // Service name
	Mode string `json:",default=console,options=console|file|volume"` // Logging mode, console-output to console, file-output to current server (container) file, volume-output docker hanging inside the file
	Path string `json:",default=logs"` // log storage path
	Level string `json:",default=info,options=info|error|severe"` // Logging level
	Compress bool `json:",optional"` // whether to enable gzip compression
	KeepDays int `json:",optional"` // the number of days to keep the logs
	StackCooldownMillis int `json:",default=100"` // Log write interval
}
```

#### prometheus.Config
```go
type Config struct {
	Host string `json:",optional"` // prometheus listens to host
	Port int `json:",default=9101"` // prometheus listens to the port
	Path string `json:",default=/metrics"` // report address
}
```

#### SignatureConf
```go
SignatureConf struct {
    Strict bool `json:",default=false"` // Strict mode or not, if yes then PrivateKeys are required
    Expiry time.Duration `json:",default=1h"` // validity period, default 1 hour
    PrivateKeys []PrivateKeyConf // Signature key related configuration
}
```

#### PrivateKeyConf
```go
PrivateKeyConf struct {
    Fingerprint string // Fingerprint configuration
    KeyFile string // key configuration
}
```

#### cache.CacheConf
```go
ClusterConf []NodeConf

NodeConf struct {
    redis.RedisConf
    Weight int `json:",default=100"` // weight
}
```

#### redis.RedisConf
```go
RedisConf struct {
    Host string // redis address
    Type string `json:",default=node,options=node|cluster"` // redis type
    Pass string `json:",optional"` // redis password
}
```

## rpc configuration

The rpc configuration controls the various functions of an rpc service, including but not limited to listening address, etcd configuration, timeout, fuse configuration, etc. Below we illustrate with a common rpc service configuration.

### configuration description
```go
Config struct {
    zrpc.RpcServerConf
    CacheRedis cache.CacheConf // redis cache configuration, see the api configuration notes for details, not to be repeated here
    Mysql struct { // mysql database access configuration, see the api configuration notes for details, not here
        DataSource string
    dataSource string }
DataSource string }
```

#### zrpc.RpcServerConf
```go
RpcServerConf struct {
    service.ServiceConf // service configuration, see the api configuration description for details, not to be repeated here
    ListenOn string // rpc listener address and port, e.g. 127.0.0.1:8888
    Etcd discov.EtcdConf `json:",optional"` // etcd related configuration
    Auth bool `json:",optional"` // whether Auth is enabled, if yes then Redis is required
    Redis redis.RedisKeyConf `json:",optional"` // Auth authentication
    StrictControl bool `json:",optional"` // Strict mode or not, if yes then Auth fails if an error is encountered, otherwise it can be considered successful
    // pending forever is not allowed
    // never set it to 0, if zero, the underlying will set to 2s automatically
    Timeout int64 `json:",default=2000"` // Timeout control, in milliseconds
    CpuThreshold int64 `json:",default=900,range=[0:1000]"` cpu down load threshold, default 900, allowable range 0 to 1000
}
```

#### discov.EtcdConf
```go
type EtcdConf struct {
	Hosts []string // etcd host array
	Key string // rpc registration key
}
```

#### redis.RedisKeyConf
```go
RedisConf struct {
    Host string // redis host
    Type string `json:",default=node,options=node|cluster"` // redis type
    Pass string `json:",optional"` // redis password
}

RedisKeyConf struct {
    RedisConf
    Key string `json:",optional"` // authentication key
}
```

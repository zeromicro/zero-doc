# API configuration

> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

The api configuration controls various functions in the api service, including but not limited to the service listening address, port, environment configuration, log configuration, etc. Let's take a simple configuration to see what the common configurations in the api do.

## Configuration instructions
Through the yaml configuration, we will find that there are many parameters that we are not aligned with config. This is because many of the config definitions are labeled with `optional` or `default`. For `optional` options, you can choose according to your own Need to determine whether it needs to be set. For the `default` tag, if you think the default value is enough, you don't need to set it. Generally, the value in `default` basically does not need to be modified and can be considered as a best practice value.

### Config

```go
type Config struct{
    rest.RestConf // rest api configuration
    Auth struct { // jwt authentication configuration
        AccessSecret string // jwt key
        AccessExpire int64 // jwt expire, unit: second
    }
    Mysql struct { // database configuration, in addition to mysql, there may be other databases such as mongo
        DataSource string // mysql datasource, which satisfies the format of user:password@tcp(ip:port)db?queries
    }
    CacheRedis cache.CacheConf // redis cache
    UserRpc    zrpc.RpcClientConf // rpc client configuration
}    
```

### rest.RestConf
The basic configuration of api service, including monitoring address, monitoring port, certificate configuration, current limit, fusing parameters, timeout parameters and other controls, expand it, we can see:
```go
service.ServiceConf // service configuration
Host     string `json:",default=0.0.0.0"` // http listening ip, default 0.0.0.0
Port     int // http listening port, required
CertFile string `json:",optional"` // https certificate file, optional
KeyFile  string `json:",optional"` // https private key file, optional 
Verbose  bool   `json:",optional"` // whether to print detailed http request log
MaxConns int    `json:",default=10000"` // http can accept the maximum number of requests at the same time (current limit), the default is 10000
MaxBytes int64  `json:",default=1048576,range=[0:8388608]"` // http can accept the maximum Content Length of the request, the default is 1048576, and the set value cannot be between 0 and 8388608
// milliseconds
Timeout      int64         `json:",default=3000"` // timeout duration control, unit: milliseconds, default 3000
CpuThreshold int64         `json:",default=900,range=[0:1000]"` // CPU load reduction threshold, the default is 900, the allowable setting range is 0 to 1000
Signature    SignatureConf `json:",optional"` // signature configuration
```

### service.ServiceConf
```go
type ServiceConf struct {
    Name       string // service name
    Log        logx.LogConf // log configuration
    Mode       string            `json:",default=pro,options=dev|test|pre|pro"` // service environment, dev-development environment, test-test environment, pre-pre-release environment, pro-formal environment
    MetricsUrl string            `json:",optional"` // index report interface address, this address needs to support post json
    Prometheus prometheus.Config `json:",optional"` // prometheus configuration
}
```

### logx.LogConf
```go
type LogConf struct {
	ServiceName         string `json:",optional"` // service name
	Mode                string `json:",default=console,options=console|file|volume"` // Log mode, console-output to console, file-output to the current server (container) file, volume-output docker hangs in the file
	Path                string `json:",default=logs"` // Log storage path
	Level               string `json:",default=info,options=info|error|severe"` // Log level
	Compress            bool   `json:",optional"` // whether to enable gzip compression
	KeepDays            int    `json:",optional"` // log retention days
	StackCooldownMillis int    `json:",default=100"` // log write interval
}
```

### prometheus.Config
```go
type Config struct {
	Host string `json:",optional"` // prometheus monitor host
	Port int    `json:",default=9101"` // prometheus listening port
	Path string `json:",default=/metrics"` // report address
}
```

### SignatureConf
```go
SignatureConf struct {
    Strict      bool          `json:",default=false"` // Whether it is Strict mode, if it is, Private Keys is required
    Expiry      time.Duration `json:",default=1h"` // Validity period, default is 1 hour
    PrivateKeys []PrivateKeyConf // Signing key related configuration
}
```

### PrivateKeyConf
```go
PrivateKeyConf struct {
    Fingerprint string // Fingerprint configuration
    KeyFile     string // Key configuration
}
```

### cache.CacheConf
```go
ClusterConf []NodeConf

NodeConf struct {
    redis.RedisConf
    Weight int `json:",default=100"` // Weights
}
```

### redis.RedisConf
```go
RedisConf struct {
    Host string // redis address
    Type string `json:",default=node,options=node|cluster"` // redis type
    Pass string `json:",optional"` // redis password
}
```

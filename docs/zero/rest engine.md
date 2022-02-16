# rest engine参数详解

engin 定义如下：
```go
type engine struct {
	conf                 RestConf
	routes               []featuredRoutes
	unauthorizedCallback handler.UnauthorizedCallback
	unsignedCallback     handler.UnsignedCallback
	middlewares          []Middleware
	shedder              load.Shedder
	priorityShedder      load.Shedder
}
```
engine是一个服务的实例，通过配置engine的设置来给服务添加路由，鉴权，签名，中间件，降载等。
通过 `goctl api new server` 我们可以快速创建一个怎么使用engine实例如下：
```go
package main

import (
	"flag"
	"fmt"

	"server/internal/config"
	"server/internal/handler"
	"server/internal/svc"

	"github.com/zeromicro/go-zero/core/conf"
	"github.com/zeromicro/go-zero/rest"
)

var configFile = flag.String("f", "etc/server-api.yaml", "the config file")

func main() {
	flag.Parse()

	var c config.Config
	conf.MustLoad(*configFile, &c)

	ctx := svc.NewServiceContext(c)
	server := rest.MustNewServer(c.RestConf)
	defer server.Stop()

	handler.RegisterHandlers(server, ctx)

	fmt.Printf("Starting server at %s:%d...\n", c.Host, c.Port)
	server.Start()
}

```


我们可以通过如下方式看看engin都有哪些可以配置项。

- cd server/internal/config
- goctl config -path ./config.go

执行完上面的命令后，可以在config目录下看到如下生成的config.yaml文件：
```yaml
CpuThreshold: 0
Host: ""
Log:
  Compress: false
  KeepDays: 0
  Level: ""
  Mode: ""
  Path: ""
  ServiceName: ""
  StackCooldownMillis: 0
MaxBytes: 0
MaxConns: 0
MetricsUrl: ""
Mode: ""
Name: ""
Port: 0
Prometheus:
  Host: ""
  Path: ""
  Port: 0
Signature:
  Expiry: 0
  PrivateKeys: null
  Strict: false
Timeout: 0
Verbose: false
```
下面我们依次解释下各个属性的作用：



| 参数 | 作用 | 默认值 | 说明 |
| --- | --- | --- | --- |
| CpuThreshold | 这个属性是用来做降载 | 900 | 可以配置的区间是[0:1000] |
| Host | 服务监听ip地址 | 0.0.0.0 | - |
| Port | 服务监听端口 |  |  |
| Log | 配置日志收集 | - | - |
| Log.Compress | 日志是不是需要压缩 |  | 如果true，日志会用gzip方式压缩 |
| Log.KeepDays | 日志保留天数 |  |  |
| Log.Level | 记录收集日志级别 |  | 可选项为info,options=info |
| Log.Mode | 日志输出方式 |  | 可选项为console |
| Log.Path | 日志落盘目录 |  |  |
| Log.ServiceName | 配合Mode使用 |  |  |
| Log.StackCooldownMillis | 多长时间写一次 | 100ms |  |
| MaxBytes | http ContentLength 最大允许大小 | 1Mb |  |
| MaxConns | 并发连接数 | 10000 |  |
| MetricsUrl |  |  | 配合Prometheus做服务监控使用，一些服务监控信息会通过post发送到这个指定的url上，详细可查看 `remotewriter.go` 文件 |
| Prometheus | prometheus服务监控配置 |  |  |
| Mode | 服务运行模式，可选项为 |  | 可选项为dev |
| Name | 服务名称 |  |  |
| Timeout | 请求超时时间设置 | 3s |  |
| Verbose | 请求体/响应体是否打印 |  | 打开时框架会打印很详细的request和response日志信息，测试阶段方便查问题。 |
| Signature |  |  | 配置签名，这个比较复杂，后续会另外起一篇文章详细解释签名，签名目的是为了防止传输内容被抓包暴露协议内容。 |


<Vssue title="restengine" />


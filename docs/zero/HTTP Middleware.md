# 使用 HTTP Middleware



使用 HTTP Middleware 可以有效的对 HTTP 的请求体，响应体进行拦截，做一些自定义的操作。


在 go-zero 中使用 HTTP Middleware 共有两种方式。

1. 全局 Middleware 配置
1. 路由组 Middleware 配置



接下来以快速开始中最基础的 greet 项目做演示。


# 准备工作
首先准备一个最基本的 greet 演示项目。以下代码均由 goctl 生成，未进行编辑。

项目结构如下:
```bash
$ tree                           
.
├── etc
│   └── greet-api.yaml
├── go.mod
├── go.sum
├── greet.api
├── greet.go
└── internal
    ├── config
    │   └── config.go
    ├── handler
    │   ├── greethandler.go
    │   └── routes.go
    ├── logic
    │   └── greetlogic.go
    ├── svc
    │   └── servicecontext.go
    └── types
        └── types.go
```


greet/greet.go:
```go
package main

import (
	"flag"
	"fmt"

	"greet/internal/config"
	"greet/internal/handler"
	"greet/internal/svc"

	"github.com/zeromicro/go-zero/core/conf"
	"github.com/zeromicro/go-zero/rest"
)

var configFile = flag.String("f", "etc/greet-api.yaml", "the config file")

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


我们先在 Greet 方法中加入一行日志输出，用来代表我们的业务处理逻辑


greet/internal/logic/greetlogic.go :
```go
package logic

import (
	"context"

	"greet/internal/svc"
	"greet/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GreetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGreetLogic(ctx context.Context, svcCtx *svc.ServiceContext) GreetLogic {
	return GreetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GreetLogic) Greet(req types.Request) (*types.Response, error) {
	// 在这里加入业务逻辑，我们用打印日志来代表业务逻辑
    l.Infof("name: %v", req.Name)
	return &types.Response{}, nil
}

```
# 全局 Middleware 配置




首先我们创建一个 Middleware 方法


```go
func middlewareDemoFunc(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		logx.Info("request ... ")
		next(w, r)
		logx.Info("reponse ... ")
	}
}
```


然后将其注册到 go-zero 的 rest 中

```go
func main() {
	
    ···
    
	server := rest.MustNewServer(c.RestConf)
	defer server.Stop()
    
	server.Use(
		middlewareDemoFunc,
	)
	
    ···

	server.Start()
}

```
启动项目，并使用 curl 进行请求，终端输出如下:


curl:
```bash
$ curl -i http://localhost:8888/from/you
HTTP/1.1 200 OK
Content-Type: application/json
Date: Fri, 23 Oct 2020 07:42:48 GMT
Content-Length: 14

{"message":""}
```
server:
```bash
$ go run greet.go -f etc/greet-api.yaml
Starting server at 0.0.0.0:8888...
{"@timestamp":"2020-10-23T15:42:48.113+08","level":"info","content":"request..."}
{"@timestamp":"2020-10-23T15:42:48.113+08","level":"info","content":"name: you","trace":"373939c095f9c52f","span":"0"}
{"@timestamp":"2020-10-23T15:42:48.113+08","level":"info","content":"reponse..."}
{"@timestamp":"2020-10-23T15:42:48.113+08","level":"info","content":"200 - /from/you - [::1]:52864 - curl/7.64.1 - 0.3ms","trace":"373939c095f9c52f","span":"0"}
```


# 路由组 Middleware 配置


路由组 Middleware 只对特定的路由有效，使用路由组 Middleware 只需我们在注册路由时使用 `rest.WithMiddleware()` 或 `rest.WithMiddlewares()` 方法传入我们定义的 Middleware 即可。


goctl 支持生成路由组 Middleware 


在 goctl 中可使用以下语法来定义路由组 Middleware 


greet/greet.api :


```protobuf
···

@server(
    middleware: GreetMiddleware1, GreetMiddleware2
)
service greet-api {
  @handler GreetHandler
  get /from/:name(Request) returns (Response);
}

···
```
**使用 goctl 命令重新生成路由代码**


```bash
$ goctl api go -api ./greet.api -dir .
etc/greet-api.yaml exists, ignored generation
internal/config/config.go exists, ignored generation
greet.go exists, ignored generation
internal/svc/servicecontext.go exists, ignored generation
internal/types/types.go exists, overwrite it?
Enter to overwrite or Ctrl-C to cancel...
internal/handler/greethandler.go exists, ignored generation
internal/handler/routes.go exists, overwrite it?
Enter to overwrite or Ctrl-C to cancel...
internal/logic/greetlogic.go exists, ignored generation
Done.
```




具体代码如下:


没有使用 Middleware 的路由组


greet/internal/handler/routes.go: 
```go
···

func RegisterHandlers(engine *rest.Server, serverCtx *svc.ServiceContext) {
	engine.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/from/:name",
				Handler: greetHandler(serverCtx),
			},
		},
	)
}

···
```
加入 Middleware 的路由组


greet/internal/handler/routes.go: 
```go
···

func RegisterHandlers(engine *rest.Server, serverCtx *svc.ServiceContext) {
	engine.AddRoutes(
		rest.WithMiddlewares(
			[]rest.Middleware{serverCtx.GreetMiddleware1, serverCtx.GreetMiddleware2},
			[]rest.Route{
				{
					Method:  http.MethodGet,
					Path:    "/from/:name",
					Handler: greetHandler(serverCtx),
				},
			}...,
		),
	)
 )
    
···
```


**注意：** goctl 命令行工具不会覆盖 greet/internal/svc/servicecontext.go 文件，而使用 goctl 定义的 Middleware 方法在 greet/internal/svc/servicecontext.go 中，因此我们需要手动修改 greet/internal/svc/servicecontext.go 文件，添加我们所需要的 `serverCtx.GreetMiddleware1`, `serverCtx.GreetMiddleware2` 方法。在首次生成代码的新项目中，由于不存在 internal/svc/servicecontext.go 文件，goctl 会生成 Middleware 方法的声明，具体实现需要自己来完成。


这里的 `serverCtx.GreetMiddleware1`, `serverCtx.GreetMiddleware2` 需要我们自己进行实现。


我们简单实现一下。




```go
package svc

import (
	"greet/internal/config"
	"net/http"

	"github.com/zeromicro/go-zero/core/logx"
	"github.com/zeromicro/go-zero/rest"
)

type ServiceContext struct {
	Config           config.Config
	GreetMiddleware1 rest.Middleware
	GreetMiddleware2 rest.Middleware
}

func NewServiceContext(c config.Config) *ServiceContext {
	return &ServiceContext{
		Config:           c,
		GreetMiddleware1: greetMiddleware1,
		GreetMiddleware2: greetMiddleware2,
	}
}

func greetMiddleware1(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		logx.Info("greetMiddleware1 request ... ")
		next(w, r)
		logx.Info("greetMiddleware1 reponse ... ")
	}
}

func greetMiddleware2(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		logx.Info("greetMiddleware2 request ... ")
		next(w, r)
		logx.Info("greetMiddleware2 reponse ... ")
	}
}
```


启动服务并使用 curl 进行请求，可以观察到如下输出:


curl:
```bash
$ curl -i http://localhost:8888/from/you
HTTP/1.1 200 OK
Content-Type: application/json
Date: Fri, 23 Oct 2020 08:14:27 GMT
Content-Length: 14

{"message":""}
```


server:


```bash
$ go run greet.go -f etc/greet-api.yaml
Starting server at 0.0.0.0:8888...
{"@timestamp":"2020-10-23T16:14:27.655+08","level":"info","content":"greetMiddleware1 request ... "}
{"@timestamp":"2020-10-23T16:14:27.655+08","level":"info","content":"greetMiddleware2 request ... "}
{"@timestamp":"2020-10-23T16:14:27.655+08","level":"info","content":"name: you","trace":"102aee4a4a935210","span":"0"}
{"@timestamp":"2020-10-23T16:14:27.655+08","level":"info","content":"greetMiddleware2 reponse ... "}
{"@timestamp":"2020-10-23T16:14:27.655+08","level":"info","content":"greetMiddleware1 reponse ... "}
{"@timestamp":"2020-10-23T16:14:27.655+08","level":"info","content":"200 - /from/you - [::1]:53701 - curl/7.64.1 - 0.3ms","trace":"102aee4a4a935210","span":"0"}
```

<Vssue title="httpmiddleware" />

# 单体服务

## 前言
由于go-zero集成了web/rpc于一体，社区有部分小伙伴会问我，go-zero的定位是否是一款微服务框架，答案是不止于此，
go-zero虽然集众多功能于一身，但你可以将其中任何一个功能独立出来去单独使用，也可以开发单体服务，
不是说每个服务上来就一定要采用微服务的架构的设计，这点大家可以看看作者(kevin)的第四期[开源说](https://www.bilibili.com/video/BV1Jy4y127Xu) ，其中对此有详细的讲解。

## 创建greet服务

```shell
$ mkdir go-zero-demo
$ cd go-zero-demo
$ go mod init go-zero-demo
$ goctl api new greet
$ go mod tidy
Done.
```

> 说明：如无 `cd` 改变目录的操作，所有操作均在 `go-zero-demo` 目录执行

查看一下`greet`服务的目录结构
```shell
$ tree greet
greet
├── etc
│   └── greet-api.yaml
├── greet.api
├── greet.go
└── internal
    ├── config
    │   └── config.go
    ├── handler
    │   ├── greethandler.go
    │   └── routes.go
    ├── logic
    │   └── greetlogic.go
    ├── svc
    │   └── servicecontext.go
    └── types
        └── types.go
```
由以上目录结构可以观察到，`greet`服务虽小，但"五脏俱全"。接下来我们就可以在`greetlogic.go`中编写业务代码了。

## 编写逻辑
```shell
$ vim greet/internal/logic/greetlogic.go 
```
```go
func (l *GreetLogic) Greet(req *types.Request) (*types.Response, error) {
	return &types.Response{
		Message: "Hello go-zero",
	}, nil
}
```

## 启动并访问服务

* 启动服务

  ```shell
  $ cd greet
  $ go run greet.go -f etc/greet-api.yaml
  ```

  输出如下，服务启动并侦听在8888端口：

  ```text
  Starting server at 0.0.0.0:8888...
  ```

* 访问服务

  ```shell
  $ curl -i -X GET http://localhost:8888/from/you
  ```
    
  返回如下：

  ```text
  HTTP/1.1 200 OK
  Content-Type: application/json
  Date: Sun, 07 Feb 2021 04:31:25 GMT
  Content-Length: 27
    
  {"message":"Hello go-zero"}
    ```

# 源码
[greet源码](https://github.com/zeromicro/go-zero-demo/tree/master/greet)

# 猜你想看
* [goctl使用说明](goctl.md)
* [api目录结构介绍](api-dir.md)
* [api语法](api-grammar.md)
* [api配置文件介绍](api-config.md)
* [api中间件使用](middleware.md)

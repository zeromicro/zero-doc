---
sidebar_position: 3
---

# 构建API服务

### 创建greet服务
```shell
$ cd ~/go-zero-demo
$ go mod init go-zero-demo
$ goctl api new greet
Done.
```

查看一下`greet`服务的结构
```shell
$ cd greet
$ tree
```

```text
.
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

### 编写逻辑

```go title="$ vim ~/go-zero-demo/greet/internal/logic/greetlogic.go"
func (l *GreetLogic) Greet(req types.Request) (*types.Response, error) {
	return &types.Response{
		Message: "Hello go-zero",
	}, nil
}
```

### 启动并访问服务

* 启动服务
```shell
$ cd ~/go-zero-demo/greet
$ go run greet.go -f etc/greet-api.yaml
```
```text
Starting server at 0.0.0.0:8888...
```

* 访问服务

```shell
$ curl -i -X GET \
  http://localhost:8888/from/you
```

```text
HTTP/1.1 200 OK
Content-Type: application/json
Date: Sun, 07 Feb 2021 04:31:25 GMT
Content-Length: 27

{"message":"Hello go-zero"}
```

### 源码
[greet源码](https://github.com/zeromicro/go-zero-demo/tree/master/greet)





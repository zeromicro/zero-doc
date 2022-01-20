---
sidebar_position: 3
---

# Build API

### Create greet service

```shell
$ cd ~/go-zero-demo
$ go mod init go-zero-demo
$ goctl api new greet
Done.
```

Take a look at the structure of the `greet` service

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

As you can see from the above directory structure, the `greet` service is small, but it has all the "guts". Next we can write the business code in `greetlogic.go`.

### Writing logic
```shell
$ vim ~/go-zero-demo/greet/internal/logic/greetlogic.go 
```

```go 
func (l *GreetLogic) Greet(req types.Request) (*types.Response, error) {
	return &types.Response{
		Message: "Hello go-zero",
	}, nil
}
```

### Start and access the service

* Start-up services
```shell
$ cd ~/go-zero-demo/greet
$ go run greet.go -f etc/greet-api.yaml
```
```text
Starting server at 0.0.0.0:8888...
```

* Access services
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

### Source Code

[greet source code](https://github.com/zeromicro/go-zero-demo/tree/master/greet)









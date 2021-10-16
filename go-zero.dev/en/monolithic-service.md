# Monolithic Service
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

## Forward
Since go-zero integrates web/rpc, some friends in the community will ask me whether go-zero is positioned as a microservice framework.
The answer is no. Although go-zero integrates many functions, you can use any one of them independently, or you can develop a single service.

It is not that every service must adopt the design of the microservice architecture. For this point, you can take a look at the fourth issue of the author (kevin) [OpenTalk](https://www.bilibili.com/video/BV1Jy4y127Xu) , Which has a detailed explanation on this.

## Create greet service
```shell
$ cd ~/go-zero-demo
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
├── go.mod
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
It can be observed from the above directory structure that although the `greet` service is small, it has "all internal organs". Next, we can write business code in `greetlogic.go`.

## Write logic
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

## Start and access the service

* Start service
    ```shell
    $ cd ~/go-zer-demo/greet
    $ go run greet.go -f etc/greet-api.yaml
    ```
    ```text
    Starting server at 0.0.0.0:8888...
    ```

* Access service
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

# Source code
[greet source code](https://github.com/zeromicro/go-zero-demo/tree/master/greet)

# Guess you wants
* [Goctl](goctl.md)
* [API Directory Structure](api-dir.md)
* [API IDL](api-grammar.md)
* [API Configuration](api-config.md)
* [Middleware](middleware.md)




# Microservice
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

In the previous article, we have demonstrated how to quickly create a monolithic service. Next, let’s demonstrate how to quickly create a microservice.
In this section, the api part is actually the same as the creation logic of the monolithic service, except that there is no communication between services in the monolithic service.
And the api service in the microservice will have more rpc call configuration.

## Forward
This section will briefly demonstrate with an `order service` calling `user service`. The demo code only conveys ideas, and some links will not be listed one by one.

## Scenario summary
Suppose we are developing a mall project, and the developer Xiao Ming is responsible for the development of the user module (user) and the order module (order). Let's split these two modules into two microservices.①

> [!NOTE] 
> ①: The splitting of microservices is also a science, and we will not discuss the details of how to split microservices here.

## Demonstration function goal
* Order service (order) provides a query interface
* User service (user) provides a method for order service to obtain user information

## Service design analysis
According to the scenario summary, we can know that the order is directly facing the user, and the data is accessed through the http protocol, and some basic data of the user needs to be obtained inside the order. Since our service adopts the microservice architecture design,
Then two services (user, order) must exchange data. The data exchange between services is the communication between services. At this point, it is also a developer’s need to adopt a reasonable communication protocol.
For consideration, communication can be carried out through http, rpc and other methods. Here we choose rpc to implement communication between services. I believe that I have already made a better scenario description of "What is the role of rpc service?".
Of course, there is much more than this design analysis before a service is developed, and we will not describe it in detail here. From the above, we need:
* user rpc
* order api

two services to initially implement this small demo.

## Create mall project
```shell
$ cd ~/go-zero-demo
$ mkdir mall && cd mall
```

## Create user rpc service

* new user rpc
    ```shell
    $ cd ~/go-zero-demo/mall
    $ mkdir -p user/rpc&&cd user/rpc  
    ```

* Add `user.proto` file, add `getUser` method

    ```shell
    $ vim ~/go-zero-demo/mall/user/user.proto
    ```
  
    ```protobuf
    syntax = "proto3";

    package user;
    
    option go_package = "user";
  
    message IdRequest {
        string id = 1;
    }
    
    message UserResponse {
        string id = 1;
        string name = 2;
        string gender = 3;
    }
    
    service User {
        rpc getUser(IdRequest) returns(UserResponse);
    }
    ```
* Generate code

    ```shell
    $ cd ~/go-zero-demo/mall/user/rpc
    $ goctl rpc proto -src user.proto -dir .
    [goclt version <=1.2.1] protoc  -I=/Users/xx/mall/user user.proto --goctl_out=plugins=grpc:/Users/xx/mall/user/user
    [goctl version > 1.2.1] protoc  -I=/Users/xx/mall/user user.proto --go_out=plugins=grpc:/Users/xx/mall/user/user
    Done.
    ```

> [!TIPS]
> If the installed version of `protoc-gen-go` is larger than 1.4.0, it is recommended to add `go_package` to the proto file


* Fill in business logic

    ```shell
    $ vim internal/logic/getuserlogic.go
    ```
    ```go
    package logic

    import (
        "context"
      
        "go-zero-demo/mall/user/internal/svc"
        "go-zero-demo/mall/user/user"
    
        "github.com/tal-tech/go-zero/core/logx"
    )
    
    type GetUserLogic struct {
        ctx    context.Context
        svcCtx *svc.ServiceContext
        logx.Logger
    }
    
    func NewGetUserLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetUserLogic {
        return &GetUserLogic{
            ctx:    ctx,
            svcCtx: svcCtx,
            Logger: logx.WithContext(ctx),
        }
    }
    
    func (l *GetUserLogic) GetUser(in *user.IdRequest) (*user.UserResponse, error) {
        return &user.UserResponse{
            Id:   "1",
            Name: "test",
        }, nil
    }
    ```

## Create order api service
* Create an `order api` service

    ```shell
    $ cd ~/go-zero-demo/mall
    $ mkdir -p order/api&&cd order/api
    ```
  
* Add api file
    ```shell
    $ vim order.api
    ```
    ```go
    type(
        OrderReq {
            Id string `path:"id"`
        }
    
        OrderReply {
            Id string `json:"id"`
            Name string `json:"name"`
        }
    )
    service order {
        @handler getOrder
        get /api/order/get/:id (OrderReq) returns (OrderReply)
    }
    ```
* Generate `order` service
    ```shell
    $ goctl api go -api order.api -dir .
    Done.
    ```
* Add user rpc configuration

    ```shell
    $ vim internal/config/config.go
    ```
    ```go
    package config

    import "github.com/tal-tech/go-zero/rest"
    import "github.com/tal-tech/go-zero/zrpc"
  
    type Config struct {
        rest.RestConf
        UserRpc zrpc.RpcClientConf
    }
    ```
* Add yaml configuration

    ```shell
    $ vim etc/order.yaml 
    ```
    ```yaml
    Name: order
    Host: 0.0.0.0
    Port: 8888
    UserRpc:
      Etcd:
        Hosts:
        - 127.0.0.1:2379
        Key: user.rpc
    ```
* Improve service dependence

    ```shell
    $ vim internal/svc/servicecontext.go
    ```
    ```go
    package svc

    import (
        "go-zero-demo/mall/order/api/internal/config"
        "go-zero-demo/mall/user/rpc/userclient"
  
        "github.com/tal-tech/go-zero/zrpc"
    )
    
    type ServiceContext struct {
        Config  config.Config
        UserRpc userclient.User
    }
    
    func NewServiceContext(c config.Config) *ServiceContext {
        return &ServiceContext{
            Config:  c,
            UserRpc: userclient.NewUser(zrpc.MustNewClient(c.UserRpc)),
        }
    }
    ```

* Add order demo logic

  Add business logic to `getorderlogic`
  ```shell
  $ vim ~/go-zero-demo/mall/order/api/internal/logic/getorderlogic.go
  ```
  ```go
  user, err := l.svcCtx.UserRpc.GetUser(l.ctx, &userclient.IdRequest{
      Id: "1",
  })
  if err != nil {
      return nil, err
  }

  if user.Name != "test" {
      return nil, errors.New("User does not exist")
  }

  return &types.OrderReply{
      Id:   req.Id,
      Name: "test order",
  }, nil
  ```

## Start the service and verify
* Start etcd
  ```shell
  $ etcd
  ```
* Start user rpc
  ```shell
  $ go run user.go -f etc/user.yaml
  ```
  ```text
  Starting rpc server at 127.0.0.1:8080...
  ```
  
* Start order api
  ```shell
  $ go run order.go -f etc/order.yaml
  ```
  ```text
  Starting server at 0.0.0.0:8888...
  ```
* Access order api
  ```shell
  curl -i -X GET \
  http://localhost:8888/api/order/get/1
  ```
  
  ```text
  HTTP/1.1 200 OK
  Content-Type: application/json
  Date: Sun, 07 Feb 2021 03:45:05 GMT
  Content-Length: 30

  {"id":"1","name":"test order"}
  ```

> [!TIP]
> The api syntax mentioned in the demo, how to use and install rpc generation, goctl, goctl environment, etc. are not outlined in detail in the quick start. We will have detailed documents to describe in the follow-up. You can also click on the following [Guess you think View] View the corresponding document for quick jump.

# Source code
[mall source code](https://github.com/zeromicro/go-zero-demo/tree/master/mall)

# Guess you wants
* [Goctl](goctl.md)
* [API Directory Structure](api-dir.md)
* [API IDL](api-grammar.md)
* [API Configuration](api-config.md)
* [Middleware](middleware.md)
* [RPC Directory Structure](rpc-dir.md)
* [RPC Configuration](rpc-config.md)
* [RPC Implement & Call](rpc-call.md)

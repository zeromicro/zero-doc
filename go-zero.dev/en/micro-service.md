# Microservices

> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc -contibute.md)

In the previous article we have shown how to quickly create a single service, next we will show how to quickly create a microservice.
In this section, the api part is actually the same logic as the monolithic service, except that there is no communication between services in the monolithic service, and the api service in the microservice will have more configuration for rpc calls.

## Preface
This section will be a simple demonstration of an `order service` to call the `user service`, the demo code only to pass the idea, some of the links will not be enumerated.

## Scenario Summary
Suppose we are developing a mall project, and the developer Xiaoming is responsible for the development of the user module (user) and the order module (order), let's split these two modules into two microservices ①

> [!NOTE]
> ①: The splitting of microservices is also a learning curve, so we won't discuss the details of how to split microservices here.

## Demonstrate functional goals
* Order service(order) provides a query interface
* user service (user) provides a method for the order service to obtain user information

## Service Design Analysis

According to the scenario synopsis we can learn that the order is directly user-oriented, accessing data through the http protocol, and the order internal need to obtain some basic data about the user, since our service is designed using the microservices architecture.
Then the two services (user,order) must exchange data, the data exchange between services that is, the communication between services, to here, the use of a reasonable communication protocol is also a developer needs to
Here we choose rpc to realize the communication between services, and I believe I have already made a better scenario of "What is the role of rpc service? I believe I have already described a good scenario here.
Of course, there is much more to a service than just design analysis before development, so we won't go into detail here. From the above, we know that we need a
* user rpc
* order api

two services to initially implement this little demo.

## Create mall project

> If you run the monolithic example, which is also called ``go-zero-demo``, you may need to change the parent directory.

```shell
$ mkdir go-zero-demo
$ cd go-zero-demo
$ go mod init go-zero-demo
```

> Note: If there is no ``cd`` operation to change the directory, all operations are performed in the ``go-zero-demo` directory

## Create user rpc service

* Create the user rpc service

  ```shell
  $ mkdir -p mall/user/rpc
  ```

* Add `user.proto` file, add `getUser` method

  ```shell
  $ vim mall/user/rpc/user.proto
  ```

  Add the following code.

  ```protobuf
  syntax = "proto3";

  package user;
    
  // protoc-gen-go version is greater than 1.4.0, proto file needs to add go_package, otherwise it can't be generated
  option go_package = "./user";
  
  message IdRequest {
      string id = 1;
  }
    
  message UserResponse {
      // user id
      string id = 1;
      // user name
      string name = 2;
      // user gender
      string gender = 3;
  }
    
  service User {
      rpc getUser(IdRequest) returns(UserResponse);
  }
  ```

* Generate the code

  ```shell
  $ cd mall/user/rpc
  $ goctl rpc protoc user.proto --go_out=./types --go-grpc_out=./types --zrpc_out=.
  Done.
  ```

> [!TIPS]
> grpc directive details refer to https://grpc.io/docs/languages/go/quickstart/

* Padding business logic

  ```shell
  $ vim internal/logic/getuserlogic.go
  ```
  ```go
  package logic
  
  import (
      "context"
  
      "go-zero-demo/mall/user/rpc/internal/svc"
      "go-zero-demo/mall/user/rpc/types/user"
  
      "github.com/zeromicro/go-zero/core/logx"
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
* Create `order api` service

  ```shell
  # in dir go-zero-demo/mall
  $ mkdir -p order/api && cd order/api
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
          Id   string `json:"id"`
          Name string `json:"name"`
      }
  )

  service order {
      @handler getOrder
      get /api/order/get/:id (OrderReq) returns (OrderReply)
  }
  ```

* Generate the order service
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

  import (
      "github.com/zeromicro/go-zero/zrpc"
      "github.com/zeromicro/go-zero/rest"
  )
  
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
* refine the service dependencies

  ```shell
  $ vim internal/svc/servicecontext.go
  ```
  ```go
  package svc

  import (
      "go-zero-demo/mall/order/api/internal/config"
      "go-zero-demo/mall/user/rpc/user"

      "github.com/zeromicro/go-zero/zrpc"
  )

  type ServiceContext struct {
      Config  config.Config
      UserRpc user.User
  }

  func NewServiceContext(c config.Config) *ServiceContext {
      return &ServiceContext{
          Config:  c,
          UserRpc: user.NewUser(zrpc.MustNewClient(c.UserRpc)),
      }
  }
  ```

* Adding order demo logic

  Add business logic to `getorderlogic`
  ```shell
  $ vim internal/logic/getorderlogic.go
  ```

  ```go
  package logic

  import (
      "context"
      "errors"

      "go-zero-demo/mall/order/api/internal/svc"
      "go-zero-demo/mall/order/api/internal/types"
      "go-zero-demo/mall/user/rpc/types/user"

      "github.com/zeromicro/go-zero/core/logx"
  )

  type GetOrderLogic struct {
      logx.Logger
      ctx    context.Context
      svcCtx *svc.ServiceContext
  }

  func NewGetOrderLogic(ctx context.Context, svcCtx *svc.ServiceContext) GetOrderLogic {
      return GetOrderLogic{
          Logger: logx.WithContext(ctx),
          ctx:    ctx,
          svcCtx: svcCtx,
      }
  }

  func (l *GetOrderLogic) GetOrder(req types.OrderReq) (*types.OrderReply, error) {
      user, err := l.svcCtx.UserRpc.GetUser(l.ctx, &user.IdRequest{
          Id: "1",
      })
      if err != nil {
          return nil, err
      }

      if user.Name != "test" {
          return nil, errors.New("用户不存在")
      }

      return &types.OrderReply{
          Id:   req.Id,
          Name: "test order",
      }, nil
  }
  ```

## Start the service and verify
* start etcd
  ```shell
  $ etcd
  ```
* download dependencies
  ```shell
  # in dir go-zero-demo
  $ go mod tidy
  ```
* start user rpc
  ```shell
  # in dir mall/user/rpc
  $ go run user.go -f etc/user.yaml
  Starting rpc server at 127.0.0.1:8080...
  ```

* start order api
  ```shell
  # in dir mall/order/api
  $ go run order.go -f etc/order.yaml
  Starting server at 0.0.0.0:8888...
  ```
  
* Accessing the order api
  ```shell
  curl -i -X GET http://localhost:8888/api/order/get/1
  HTTP/1.1 200 OK
  Content-Type: application/json
  Date: Sun, 07 Feb 2021 03:45:05 GMT
  Content-Length: 30

  {"id": "1", "name": "test order"}
  ```

> [!TIP]
> The api syntax mentioned in the demo, rpc generation, goctl, goctl environment, etc. how to use and install, the quick start does not provide a detailed overview, we will have a detailed description of the subsequent documentation, you can also click the following [guess what you want to see] quick jump to see the corresponding documentation.

# Source Code
[mall source code](https://github.com/zeromicro/go-zero-demo/tree/master/mall)

# Guess what you want to see
* [goctl Usage Notes](goctl.md)
* [api directory structure introduction](api-dir.md)
* [api syntax](api-grammar.md)
* [api configuration file introduction](api-config.md)
* [api middleware usage](middleware.md)
* [rpc directory](rpc-dir.md)
* [rpc-config](rpc-config.md)
* [rpc caller description](rpc-call.md)

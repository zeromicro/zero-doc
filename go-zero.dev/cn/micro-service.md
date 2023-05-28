# 微服务

在上一篇我们已经演示了怎样快速创建一个单体服务，接下来我们来演示一下如何快速创建微服务，
在本小节中，api部分其实和单体服务的创建逻辑是一样的，只是在单体服务中没有服务间的通讯而已，
且微服务中api服务会多一些rpc调用的配置。

## 前言
本小节将以一个`订单服务`调用`用户服务`来简单演示一下，演示代码仅传递思路，其中有些环节不会一一列举。

## 情景提要
假设我们在开发一个商城项目，而开发者小明负责用户模块(user)和订单模块(order)的开发，我们姑且将这两个模块拆分成两个微服务①

> [注意] ①：微服务的拆分也是一门学问，这里我们就不讨论怎么去拆分微服务的细节了。

## 演示功能目标
* 订单服务(order)提供一个查询接口
* 用户服务(user)提供一个方法供订单服务获取用户信息

## 服务设计分析

根据情景提要我们可以得知，订单是直接面向用户，通过http协议访问数据，而订单内部需要获取用户的一些基础数据，既然我们的服务是采用微服务的架构设计，
那么两个服务（user, order）就必须要进行数据交换，服务间的数据交换即服务间的通讯，到了这里，采用合理的通讯协议也是一个开发人员需要
考虑的事情，可以通过http，rpc等方式来进行通讯，这里我们选择rpc来实现服务间的通讯，相信这里我已经对"rpc服务存在有什么作用？"已经作了一个比较好的场景描述。
当然，一个服务开发前远不止这点设计分析，我们这里就不详细描述了。从上文得知，我们需要一个
* user rpc
* order api

两个服务来初步实现这个小demo。

## 创建mall工程

> 如果你跑了单体的示例，里面也叫 `go-zero-demo`，你可能需要换一个父目录。

```shell
$ mkdir go-zero-demo
$ cd go-zero-demo
$ go mod init go-zero-demo
```

> 说明：如无 `cd` 改变目录的操作，所有操作均在 `go-zero-demo` 目录执行

## 创建user rpc服务

* 创建user rpc服务

  ```shell
  $ mkdir -p mall/user/rpc
  ```

* 添加`user.proto`文件，增加`getUser`方法

  ```shell
  $ vim mall/user/rpc/user.proto
  ```
    
  增加如下代码：
  
  ```protobuf
  syntax = "proto3";

  package user;
    
  // protoc-gen-go 版本大于1.4.0, proto文件需要加上go_package,否则无法生成
  option go_package = "./user";
  
  message IdRequest {
      string id = 1;
  }
    
  message UserResponse {
      // 用户id
      string id = 1;
      // 用户名称
      string name = 2;
      // 用户性别
      string gender = 3;
  }
    
  service User {
      rpc getUser(IdRequest) returns(UserResponse);
  }
  ```

* 生成代码
  如未安装 `protoc`,`protoc-gen-go`,`protoc-gen-grpc-go` 你可以通过如下指令一键安装:
  ```bash
  $ goctl env check -i -f
  ```
  
  > 注意：
  > 1、每一个 `*.proto`文件只允许有一个service `error: only one service expected`
  
  ```shell
  $ cd mall/user/rpc
  $ goctl rpc protoc user.proto --go_out=./types --go-grpc_out=./types --zrpc_out=.
  Done.
  ```

* 填充业务逻辑

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

## 创建order api服务
* 创建 `order api`服务

  ```shell
  # 回到 go-zero-demo/mall 目录
  $ mkdir -p order/api && cd order/api
  ```
  
* 添加api文件

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

* 生成order服务

  ```shell
  $ goctl api go -api order.api -dir .
  Done.
  ```

* 添加user rpc配置

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

* 添加yaml配置

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

* 完善服务依赖

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
      UserRpc userclient.User
  }

  func NewServiceContext(c config.Config) *ServiceContext {
      return &ServiceContext{
          Config:  c,
          UserRpc: userclient.NewUser(zrpc.MustNewClient(c.UserRpc)),
      }
  }
  ```

* 添加order演示逻辑
  
  给 `getorderlogic` 添加业务逻辑
  
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

  func (l *GetOrderLogic) GetOrder(req *types.OrderReq) (*types.OrderReply, error) {
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

## 启动服务并验证

* 启动etcd
  ```shell
  $ etcd
  ```
* 下载依赖
  ```shell
  # 在 go-zero-demo 目录下
  $ go mod tidy
  ```
* 启动user rpc
  ```shell
  # 在 mall/user/rpc 目录
  $ go run user.go -f etc/user.yaml
  Starting rpc server at 127.0.0.1:8080...
  ```
  
* 启动order api
  ```shell
  # 在 mall/order/api 目录
  $ go run order.go -f etc/order.yaml
  Starting server at 0.0.0.0:8888...
  ```
* 访问order api
  ```shell
  $ curl -i -X GET http://localhost:8888/api/order/get/1
  HTTP/1.1 200 OK
  Content-Type: application/json
  Date: Sun, 07 Feb 2021 03:45:05 GMT
  Content-Length: 30

  {"id":"1","name":"test order"}
  ```

> 注意：在演示中的提及的api语法，rpc生成，goctl，goctl环境等怎么使用和安装，快速入门中不作详细概述，我们后续都会有详细的文档进行描述，你也可以点击下文的【猜你想看】快速跳转的对应文档查看。

# 源码
[mall源码](https://github.com/zeromicro/go-zero-demo/tree/master/mall)

# 猜你想看
* [goctl使用说明](goctl.md)
* [api目录结构介绍](api-dir.md)
* [api语法](api-grammar.md)
* [api配置文件介绍](api-config.md)
* [api中间件使用](middleware.md)
* [rpc目录](rpc-dir.md)
* [rpc配置](rpc-config.md)
* [rpc调用方说明](rpc-call.md)

---
sidebar_position: 4
---

# 构建RPC服务

### 创建user rpc服务

* 创建user rpc服务
    ```shell
    $ cd ~/go-zero-demo/mall 
    $ mkdir -p user/rpc && cd user/rpc  
    ```

* 添加`user.proto`文件，增加`getUser`方法
  
    ```protobuf title="$ vim ~/go-zero-demo/mall/user/rpc/user.proto"
    syntax = "proto3";

    package user;
    
    //protoc-gen-go 版本大于1.4.0, proto文件需要加上go_package,否则无法生成
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

    ```shell
    $ cd ~/go-zero-demo/mall/user/rpc
    $ goctl rpc template -o user.proto
    $ goctl rpc proto -src user.proto -dir .
    [goclt version <=1.2.1] protoc  -I=/Users/xx/mall/user user.proto --goctl_out=plugins=grpc:/Users/xx/mall/user/user
    [goctl version > 1.2.1] protoc  -I=/Users/xx/mall/user user.proto --go_out=plugins=grpc:/Users/xx/mall/user/user
    Done.
    ```
  
  :::tip protoc-gen-go版本
  
  如果安装的 `protoc-gen-go` 版大于1.4.0, proto文件建议加上`go_package`
  
  :::

* 填充业务逻辑

    ```shell
    $ vim internal/logic/getuserlogic.go
    ```
    ```go
    package logic

    import (
    	"context"

	    "go-zero-demo/mall/user/rpc/internal/svc"
	    "go-zero-demo/mall/user/rpc/user"
        
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

* 修改配置

    ```shell
    $ vim internal/config/config.go
    ```
    ```go
	package config

	import (
		"github.com/zeromicro/go-zero/zrpc"
	)

	type Config struct {
		zrpc.RpcServerConf
	}
    ```
* 添加yaml配置

    ```shell
    $ vim etc/user.yaml 
    ```
    ```yaml
    Name: user.rpc
    ListenOn: 127.0.0.1:8080
    Etcd:
      Hosts:
      - 127.0.0.1:2379
      Key: user.rpc
    ```
* 修改目录文件
    
    ```shell
    $ cd ~/go-zero-demo/mall/rpc
    $ mkdir userclient && mv /user/user.go /userclient 
    ```
### 启动服务并验证

:::tip etcd安装
  
[点此查看etcd安装教程](https://etcd.io/docs/v3.5/install/)
  
:::

* 启动etcd
  ```shell
  $ etcd
  ```
* 启动user rpc
  ```shell
  $ go run user.go -f etc/user.yaml
  ```
  ```text
  Starting rpc server at 127.0.0.1:8080...

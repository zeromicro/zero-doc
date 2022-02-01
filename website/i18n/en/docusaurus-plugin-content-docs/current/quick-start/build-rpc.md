---
sidebar_position: 4
---

# Build RPC

### Create user rpc service

* Create user rpc service
```shell
$ cd ~/go-zero-demo/mall 
$ mkdir -p user/rpc && cd user/rpc  
```

* Add `user.proto` file, add `getUser` method

```shell
$ vim ~/go-zero-demo/mall/user/rpc/user.proto
```

```protobuf
syntax = "proto3";

package user;

//protoc-gen-go version greater than 1.4.0, proto file need to add go_package, otherwise it can not be generated
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

* Generate code

 ```shell
$ cd ~/go-zero-demo/mall/user/rpc
$ goctl rpc template -o user.proto
$ goctl rpc proto -src user.proto -dir .
[goclt version <=1.2.1] protoc  -I=/Users/xx/mall/user user.proto --goctl_out=plugins=grpc:/Users/xx/mall/user/user
[goctl version > 1.2.1] protoc  -I=/Users/xx/mall/user user.proto --go_out=plugins=grpc:/Users/xx/mall/user/user
Done.
 ```
  
:::tip protoc-gen-go version
  
  If the installed version of `protoc-gen-go` is greater than 1.4.0, it is recommended to add `go_package` to the proto file
  
:::

* Populate business logic

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

* Modify the configuration

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

* Add yaml configuration

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

* Modify the directory file

```shell
$ cd ~/go-zero-demo/mall/rpc
$ mkdir userclient && mv /user/user.go /userclient 
```

### Start the service and verify

:::tip etcd installation
  
[Click here for etcd installation tutorial](https://etcd.io/docs/v3.5/install/)
  
:::

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


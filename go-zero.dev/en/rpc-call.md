# RPC Implement & Call
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

In a large system, there must be data transfer between multiple subsystems (services). If there is data transfer, you need a communication method. You can choose the simplest http for communication or rpc service for communication.
In go-zero, we use zrpc to communicate between services, which is based on grpc.

## Scenes
In the front, we have improved the interface protocol for user login, user query of books, etc., but the user did not do any user verification when querying the book. If the current user is a non-existent user, we do not allow him to view book information.
From the above information, we can know that the user service needs to provide a method to obtain user information for use by the search service, so we need to create a user rpc service and provide a getUser method.

## rpc service writing

* Compile the proto file
    ```shell
    $ vim service/user/rpc/user.proto
    ```
    ```protobuf
    syntax = "proto3";
    
    package user;
    
    option go_package = "user";
  
    message IdReq{
      int64 id = 1;
    }
    
    message UserInfoReply{
      int64 id = 1;
      string name = 2;
      string number = 3;
      string gender = 4;
    }
    
    service user {
      rpc getUser(IdReq) returns(UserInfoReply);
    }
    ```
    * Generate rpc service code
    ```shell
    $ cd service/user/rpc
    $ goctl rpc proto -src user.proto -dir .
    ```
  
> [!TIPS]
> If the installed version of `protoc-gen-go` is larger than 1.4.0, it is recommended to add `go_package` to the proto file

* Add configuration and improve yaml configuration items
    ```shell
    $ vim service/user/rpc/internal/config/config.go
    ```
    ```go
    type Config struct {
        zrpc.RpcServerConf
        Mysql struct {
            DataSource string
        }
        CacheRedis cache.CacheConf
    }
    ```
    ```shell
    $ vim /service/user/rpc/etc/user.yaml
    ```
    ```yaml
    Name: user.rpc
    ListenOn: 127.0.0.1:8080
    Etcd:
    Hosts:
    - $etcdHost
      Key: user.rpc
    Mysql:
    DataSource: $user:$password@tcp($url)/$db?charset=utf8mb4&parseTime=true&loc=Asia%2FShanghai
    CacheRedis:
    - Host: $host
      Pass: $pass
      Type: node  
    ```
    > [!TIP]
    > $user: mysql database user
    >
    > $password: mysql database password
    >
    > $url: mysql database connection address
    >
    > $db: mysql database db name, that is, the database where the user table is located
    >
    > $host: Redis connection address Format: ip:port, such as: 127.0.0.1:6379
    >
    > $pass: redis password
    > 
    > $etcdHost: etcd connection address, format: ip:port, such as: 127.0.0.1:2379
    >
    > For more configuration information, please refer to [rpc configuration introduction](rpc-config.md)

* Add resource dependency
    ```shell
    $ vim service/user/rpc/internal/svc/servicecontext.go  
    ```
    ```go
    type ServiceContext struct {
        Config    config.Config
        UserModel model.UserModel
    }
    
    func NewServiceContext(c config.Config) *ServiceContext {
        conn := sqlx.NewMysql(c.Mysql.DataSource)
        return &ServiceContext{
            Config: c,
            UserModel: model.NewUserModel(conn, c.CacheRedis),
        }
    }
    ```
* Add rpc logic
    ```shell
    $ service/user/rpc/internal/logic/getuserlogic.go
    ```
    ```go
    func (l *GetUserLogic) GetUser(in *user.IdReq) (*user.UserInfoReply, error) {
        one, err := l.svcCtx.UserModel.FindOne(in.Id)
        if err != nil {
            return nil, err
        }
        
        return &user.UserInfoReply{
            Id:     one.Id,
            Name:   one.Name,
            Number: one.Number,
            Gender: one.Gender,
        }, nil
    }
    ```

## Use rpc
Next we call user rpc in the search service

* Add UserRpc configuration and yaml configuration items
    ```shell
    $ vim service/search/api/internal/config/config.go
    ```
    ```go
    type Config struct {
        rest.RestConf
        Auth struct {
            AccessSecret string
            AccessExpire int64
        }
        UserRpc zrpc.RpcClientConf
    }
    ```
    ```shell
    $ vim service/search/api/etc/search-api.yaml
    ```
    ```yaml
    Name: search-api
    Host: 0.0.0.0
    Port: 8889
    Auth:
      AccessSecret: $AccessSecret
      AccessExpire: $AccessExpire
    UserRpc:
      Etcd:
        Hosts:
          - $etcdHost
        Key: user.rpc
    ```
    > [!TIP]
    > $AccessSecret: This value must be consistent with the one declared in the user api.
    >
    > $AccessExpire: Valid period
    >
    > $etcdHost： etcd connection address
    > 
    > The `Key` in etcd must be consistent with the Key in the user rpc service configuration
* Add dependency
    ```shell
    $ vim service/search/api/internal/svc/servicecontext.go
    ```
    ```go
    type ServiceContext struct {
        Config  config.Config
        Example rest.Middleware
        UserRpc userclient.User
    }
    
    func NewServiceContext(c config.Config) *ServiceContext {
        return &ServiceContext{
            Config:  c,
            Example: middleware.NewExampleMiddleware().Handle,
            UserRpc: userclient.NewUser(zrpc.MustNewClient(c.UserRpc)),
        }
    }
    ```
* Supplementary logic
    ```shell
    $ vim /service/search/api/internal/logic/searchlogic.go
    ```
    ```go
    func (l *SearchLogic) Search(req types.SearchReq) (*types.SearchReply, error) {
        userIdNumber := json.Number(fmt.Sprintf("%v", l.ctx.Value("userId")))
        logx.Infof("userId: %s", userIdNumber)
        userId, err := userIdNumber.Int64()
        if err != nil {
            return nil, err
        }
        
        // use user rpc
        _, err = l.svcCtx.UserRpc.GetUser(l.ctx, &userclient.IdReq{
            Id: userId,
        })
        if err != nil {
            return nil, err
        }
    
        return &types.SearchReply{
            Name:  req.Name,
            Count: 100,
        }, nil
    }
    ```
## Start and verify the service
* Start etcd, redis, mysql
* Start user rpc
    ```shell
    $ cd /service/user/rpc
    $ go run user.go -f etc/user.yaml
    ```
    ```text
    Starting rpc server at 127.0.0.1:8080...
    ```
* Start search api
```shell
$ cd service/search/api
$ go run search.go -f etc/search-api.yaml
```

* Verification Service
    ```shell
    $ curl -i -X GET \
      'http://127.0.0.1:8889/search/do?name=%E8%A5%BF%E6%B8%B8%E8%AE%B0' \
      -H 'authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MTI4NjcwNzQsImlhdCI6MTYxMjc4MDY3NCwidXNlcklkIjoxfQ.JKa83g9BlEW84IiCXFGwP2aSd0xF3tMnxrOzVebbt80'
    ```
    ```text
    HTTP/1.1 200 OK
    Content
    -Type: application/json
    Date: Tue, 09 Feb 2021 06:05:52 GMT
    Content-Length: 32
    
    {"name":"xiyouji","count":100}
    ```

# Guess you wants
* [RPC Configuration](rpc-config.md)
* [RPC Directory Structure](rpc-dir.md)
* [RPC Commands](goctl-rpc.md)

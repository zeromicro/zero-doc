# rpc编写与调用
在一个大的系统中，多个子系统（服务）间必然存在数据传递，有数据传递就需要通信方式，你可以选择最简单的http进行通信，也可以选择rpc服务进行通信，
在go-zero，我们使用zrpc来进行服务间的通信，zrpc是基于grpc。

## 场景
在前面我们完善了对用户进行登录，用户查询图书等接口协议，但是用户在查询图书时没有做任何用户校验，如果当前用户是一个不存在的用户则我们不允许其查阅图书信息，
从上文信息我们可以得知，需要user服务提供一个方法来获取用户信息供search服务使用，因此我们就需要创建一个user rpc服务，并提供一个getUser方法。

## rpc服务编写

* 编译proto文件
    ```shell
    $ vim service/user/rpc/user.proto
    ```
    ```protobuf
    syntax = "proto3";
    
    package user;
    
    option go_package = "./user";
  
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
    * 生成rpc服务代码
    ```shell
    $ cd service/user/rpc
    $ goctl rpc protoc user.proto --go_out=./types --go-grpc_out=./types --zrpc_out=.
    ```
> [!TIPS]
> 如果安装的 `protoc-gen-go` 版大于1.4.0, proto文件建议加上`go_package`

* 添加配置及完善yaml配置项
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
    > $user: mysql数据库user
    >
    > $password: mysql数据库密码
    >
    > $url: mysql数据库连接地址
    >
    > $db: mysql数据库db名称，即user表所在database
    >
    > $host: redis连接地址 格式：ip:port，如:127.0.0.1:6379
    >
    > $pass: redis密码
    > 
    > $etcdHost: etcd连接地址，格式：ip:port，如： 127.0.0.1:2379
    >
    > 更多配置信息，请参考[rpc配置介绍](rpc-config.md)

* 添加资源依赖
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
* 添加rpc逻辑
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

## 使用rpc
接下来我们在search服务中调用user rpc

* 添加UserRpc配置及yaml配置项
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
    > $AccessSecret：这个值必须要和user api中声明的一致。
    >
    > $AccessExpire: 有效期
    >
    > $etcdHost： etcd连接地址
    > 
    > etcd中的`Key`必须要和user rpc服务配置中Key一致
* 添加依赖
    ```shell
    $ vim service/search/api/internal/svc/servicecontext.go
    ```
    ```go
    type ServiceContext struct {
        Config  config.Config
        Example rest.Middleware
        UserRpc user.User
    }
    
    func NewServiceContext(c config.Config) *ServiceContext {
        return &ServiceContext{
            Config:  c,
            Example: middleware.NewExampleMiddleware().Handle,
            UserRpc: user.NewUser(zrpc.MustNewClient(c.UserRpc)),
        }
    }
    ```
* 补充逻辑
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
        
        // 使用user rpc
        _, err = l.svcCtx.UserRpc.GetUser(l.ctx, &user.IdReq{
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
## 启动并验证服务
* 启动etcd、redis、mysql
* 启动user rpc
    ```shell
    $ cd service/user/rpc
    $ go run user.go -f etc/user.yaml
    ```
    ```text
    Starting rpc server at 127.0.0.1:8080...
    ```
* 启动search api
```shell
$ cd service/search/api
$ go run search.go -f etc/search-api.yaml
```

* 验证服务
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
    
    {"name":"西游记","count":100}
    ```

# 猜你想看
* [rpc配置](rpc-config.md)
* [rpc服务目录](rpc-dir.md)
* [goctl rpc命令](goctl-rpc.md)

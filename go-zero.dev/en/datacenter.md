# How do I use go-zero to implement a Middle Ground System?

> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)


> Author: Jack Luo
> 
> Original link：https://www.cnblogs.com/jackluo/p/14148518.html

[TOC]

I recently discovered that a new star microservice framework has emerged in the golang community. 
It comes from a good future. Just looking at the name, it is very exciting. Before, I only played go-micro. 
In fact, I have not used it in the project. I think that microservices and grpc are very noble. 
They have not been in the project yet. I have really played them. I saw that the tools provided by the government are really easy to use. 
They only need to be defined, and the comfortable file structure is generated. I am concerned about business, and there was a voting activity recently, 
and in recent years, Middle Ground System have been quite popular, so I decided to give it a try.

> SourceCode: [https://github.com/jackluo2012/datacenter](https://github.com/jackluo2012/datacenter)

Let's talk about the idea of Middle Ground System architecture first：

![](https://img2020.cnblogs.com/blog/203395/202012/203395-20201217094615171-335437652.jpg)

The concept of Middle Ground System is probably to unify the apps one by one. I understand it this way anyway.

Let’s talk about user service first. Now a company has a lot of official accounts, small programs, WeChat, Alipay, and xxx xxx, and a lot of platforms. Every time we develop, we always need to provide user login services. Stop copying the code, and then we are thinking about whether we can have a set of independent user services, just tell me you need to send a platform you want to log in (such as WeChat), WeChat login, what is needed is that the client returns one to the server code, and then the server takes this code to WeChat to get user information. Anyway, everyone understands it.

We decided to get all the information into the configuration public service, and then store the appid and appkey of WeChat, Alipay and other platforms, as well as the appid and appkey of payment, and write a set.

---

Finally, let's talk about implementation, the whole is a repo:

- Gateway, we use: go-zero's Api service
- Others are services, we use go-zero rpc service

Look at the directory structure

![](https://img2020.cnblogs.com/blog/203395/202012/203395-20201209110504600-317546535.png)

After the whole project was completed, I worked alone and wrote about it for a week, and then I realized the above Middle Ground System.

## datacenter-api service


Look at the official document first [https://zeromicro.github.io/go-zero/](https://zeromicro.github.io/go-zero/)

Let's set up the gateway first:：

```shell
➜ blogs mkdir datacenter && cd datacenter
➜ datacenter go mod init datacenter
go: creating new go.mod: module datacenter
➜ datacenter
```

View the book directory:


```
➜  datacenter tree
.
└── go.mod

0 directories, 1 file
```


### Create api file


```
➜  datacenter goctl api -o datacenter.api
Done.
➜  datacenter tree
.
├── datacenter.api
└── go.mod
```


### Define api service


Respectively include the above **Public Service**, **User Service**, **Voting Activity Service**


```
info(
    title: "demo"
    desc: "demo"
    author: "jackluo"
    email: "net.webjoy@gmail.com"
)

// Get application information
type Beid struct {
    Beid int64 `json:"beid"`
}
type Token struct{
    Token string `json:"token"`
}
type WxTicket struct{
    Ticket string `json:"ticket"`
}
type Application struct {
    Sname string `json:"Sname"`
    Logo string `json:"logo"`
    Isclose int64 `json:"isclose"`
    Fullwebsite string `json:"fullwebsite"`
}
type SnsReq struct{
    Beid
    Ptyid int64  `json:"ptyid"` // Platform ID
    BackUrl string `json:"back_url"` // Return address after login
}
type SnsResp struct{
    Beid
    Ptyid int64  `json:"ptyid"` // Platform ID
    Appid string  `json:"appid"` // sns Platform ID
    Title string  `json:"title"`
    LoginUrl string `json:"login_url"` // WeChat login address
}

type WxShareResp struct {
    Appid string `json:"appid"`
    Timestamp int64 `json:"timestamp"`
    Noncestr string `json:"noncestr"`
    Signature string `json:"signature"`
}

@server(
    group: common
)
service datacenter-api {
    @doc(
        summary: "Get information about the site"
    )
    @handler votesVerification
    get /MP_verify_NT04cqknJe0em3mT.txt (SnsReq) returns (SnsResp)
    
    @handler appInfo
    get /common/appinfo (Beid) returns (Application)
    
    @doc(
        summary: "Get social attribute information of the site"
    )
    @handler snsInfo
    post /common/snsinfo (SnsReq) returns (SnsResp)
    // Get shared returns
    @handler wxTicket
    post /common/wx/ticket (SnsReq) returns (WxShareResp)
    
}

@server(
    jwt: Auth
    group: common
)
service datacenter-api {
    @doc(
        summary: "Qiniu upload credentials"
    )
    @handler qiuniuToken
    post /common/qiuniu/token (Beid) returns (Token)
}

// Registration request
type RegisterReq struct {
    Mobile   string `json:"mobile"` 
    Password string `json:"password"`
    Smscode    string `json:"smscode"`
}
// Login request
type LoginReq struct{
    Mobile   string `json:"mobile"`
    Type int64 `json:"type"`    // 1. Password login, 2. SMS login
    Password string `json:"password"`
}
// WeChat login
type WxLoginReq struct {
    Beid      int64  `json:"beid"` // Application id
    Code string `json:"code"` // WeChat AccesskKey
    Ptyid      int64  `json:"ptyid"` // Platform ID
}

//Return user information
type UserReply struct {
    Auid       int64  `json:"auid"`
    Uid       int64  `json:"uid"`
    Beid      int64  `json:"beid"` // Platform ID
    Ptyid      int64  `json:"ptyid"`
    Username string `json:"username"`
    Mobile   string `json:"mobile"`
    Nickname string `json:"nickname"`
    Openid string `json:"openid"`
    Avator string `json:"avator"`
    JwtToken
}

type AppUser struct{
    Uid       int64  `json:"uid"`
    Auid       int64  `json:"auid"`
    Beid      int64  `json:"beid"`
    Ptyid      int64  `json:"ptyid"`
    Nickname string `json:"nickname"`
    Openid string `json:"openid"`
    Avator string `json:"avator"`
}

type LoginAppUser struct{
    Uid       int64  `json:"uid"`
    Auid       int64  `json:"auid"`
    Beid      int64  `json:"beid"`
    Ptyid      int64  `json:"ptyid"`
    Nickname string `json:"nickname"`
    Openid string `json:"openid"`
    Avator string `json:"avator"`
    JwtToken
}

type JwtToken struct {
    AccessToken  string `json:"access_token,omitempty"`
    AccessExpire int64  `json:"access_expire,omitempty"`
    RefreshAfter int64  `json:"refresh_after,omitempty"`
}

type UserReq struct{
    Auid       int64  `json:"auid"`
    Uid       int64  `json:"uid"`
    Beid      int64  `json:"beid"`
    Ptyid      int64  `json:"ptyid"`
}

type Request {
    Name string `path:"name,options=you|me"`
}
type Response {
    Message string `json:"message"`
}

@server(
    group: user
)
service user-api {
    @handler ping
    post /user/ping ()
    
    @handler register
    post /user/register (RegisterReq) returns (UserReply)
    
    @handler login
    post /user/login (LoginReq) returns (UserReply)
    
    @handler wxlogin
    post /user/wx/login (WxLoginReq) returns (LoginAppUser)
    
    @handler code2Session
    get /user/wx/login () returns (LoginAppUser)
}
@server(
    jwt: Auth
    group: user
    middleware: Usercheck
)
service user-api {
    @handler userInfo
    get /user/dc/info (UserReq) returns (UserReply)
}


type Actid struct {
    Actid       int64  `json:"actid"`
}

type VoteReq struct {
    Aeid       int64  `json:"aeid"`
    Actid
}
type VoteResp struct {
    VoteReq
    Votecount       int64  `json:"votecount"`
    Viewcount       int64  `json:"viewcount"`
}


type ActivityResp struct {
    Actid           int64  `json:"actid"`
    Title           string  `json:"title"` 
    Descr           string  `json:"descr"` 
    StartDate       int64  `json:"start_date"` 
    EnrollDate      int64  `json:"enroll_date"` 
    EndDate           int64  `json:"end_date"` 
    Votecount       int64  `json:"votecount"`
    Viewcount       int64  `json:"viewcount"`
    Type            int64 `json:"type"`
    Num                int64 `json:"num"`
}

type EnrollReq struct {
    Actid
    Name           string  `json:"name"`
    Address           string  `json:"address"`
    Images           []string  `json:"images"`
    Descr           string  `json:"descr"`
}

type EnrollResp struct {
    Actid
    Aeid        int64 `json:"aeid"` 
    Name           string  `json:"name"`
    Address           string  `json:"address"`
    Images           []string  `json:"images"`
    Descr           string  `json:"descr"`
    Votecount       int64  `json:"votecount"`
    Viewcount       int64  `json:"viewcount"`
    
}

@server(
    group: votes
)
service votes-api {
    @doc(
        summary: "Get activity information"
    )
    @handler activityInfo
    get /votes/activity/info (Actid) returns (ActivityResp)
    @doc(
        summary: "Activity visit +1"
    )
    @handler activityIcrView
    get /votes/activity/view (Actid) returns (ActivityResp)
    @doc(
        summary: "Get information about registered voting works"
    )
    @handler enrollInfo
    get /votes/enroll/info (VoteReq) returns (EnrollResp)
    @doc(
        summary: "Get a list of registered works"
    )
    @handler enrollLists
    get /votes/enroll/lists (Actid)    returns(EnrollResp)
}

@server(
    jwt: Auth
    group: votes
    middleware: Usercheck
)
service votes-api {
    @doc(
        summary: "vote"
    )
    @handler vote
    post /votes/vote (VoteReq) returns (VoteResp)
    @handler enroll
    post /votes/enroll (EnrollReq) returns (EnrollResp)
}
```


The API and document ideas that are basically written above


### Generate datacenter api service


```
➜  datacenter goctl api go -api datacenter.api -dir .
Done.
➜  datacenter tree
.
├── datacenter.api
├── etc
│   └── datacenter-api.yaml
├── go.mod
├── internal
│   ├── config
│   │   └── config.go
│   ├── handler
│   │   ├── common
│   │   │   ├── appinfohandler.go
│   │   │   ├── qiuniutokenhandler.go
│   │   │   ├── snsinfohandler.go
│   │   │   ├── votesverificationhandler.go
│   │   │   └── wxtickethandler.go
│   │   ├── routes.go
│   │   ├── user
│   │   │   ├── code2sessionhandler.go
│   │   │   ├── loginhandler.go
│   │   │   ├── pinghandler.go
│   │   │   ├── registerhandler.go
│   │   │   ├── userinfohandler.go
│   │   │   └── wxloginhandler.go
│   │   └── votes
│   │       ├── activityicrviewhandler.go
│   │       ├── activityinfohandler.go
│   │       ├── enrollhandler.go
│   │       ├── enrollinfohandler.go
│   │       ├── enrolllistshandler.go
│   │       └── votehandler.go
│   ├── logic
│   │   ├── common
│   │   │   ├── appinfologic.go
│   │   │   ├── qiuniutokenlogic.go
│   │   │   ├── snsinfologic.go
│   │   │   ├── votesverificationlogic.go
│   │   │   └── wxticketlogic.go
│   │   ├── user
│   │   │   ├── code2sessionlogic.go
│   │   │   ├── loginlogic.go
│   │   │   ├── pinglogic.go
│   │   │   ├── registerlogic.go
│   │   │   ├── userinfologic.go
│   │   │   └── wxloginlogic.go
│   │   └── votes
│   │       ├── activityicrviewlogic.go
│   │       ├── activityinfologic.go
│   │       ├── enrollinfologic.go
│   │       ├── enrolllistslogic.go
│   │       ├── enrolllogic.go
│   │       └── votelogic.go
│   ├── middleware
│   │   └── usercheckmiddleware.go
│   ├── svc
│   │   └── servicecontext.go
│   └── types
│       └── types.go
└── datacenter.go

14 directories, 43 files
```


We open `etc/datacenter-api.yaml` and add the necessary configuration information


```yaml
Name: datacenter-api
Log:
  Mode: console
Host: 0.0.0.0
Port: 8857
Auth:
  AccessSecret: secret
  AccessExpire: 86400
CacheRedis:
- Host: 127.0.0.1:6379
  Pass: pass
  Type: node                     
UserRpc:
  Etcd:
    Hosts:
      - 127.0.0.1:2379
    Key: user.rpc
CommonRpc:
  Etcd:
    Hosts:
      - 127.0.0.1:2379
    Key: common.rpc
VotesRpc:
  Etcd:
    Hosts:
      - 127.0.0.1:2379
    Key: votes.rpc
```


I will write the above `UserRpc`, `CommonRpc`, and `VotesRpc` first, and then add them by step.


Let's write the `CommonRpc` service first.


## CommonRpc service


### New project directory


```
➜  datacenter mkdir -p common/rpc && cd common/rpc
```


Just create it directly in the datacenter directory, because in common, it may not only provide rpc services in the future, but also api services, so the rpc directory is added


### goctl create template


```
➜  rpc goctl rpc template -o=common.proto
➜  rpc ls
common.proto
```


Fill in the content：


```protobufbuf
➜  rpc cat common.proto
syntax = "proto3";

package common;

option go_package = "common";

message BaseAppReq{
  int64 beid=1;
}

message BaseAppResp{
  int64 beid=1;
  string logo=2;
  string sname=3;
  int64 isclose=4;
  string fullwebsite=5;
}

message AppConfigReq {
  int64 beid=1;
  int64 ptyid=2;
}

message AppConfigResp {
  int64 id=1;
  int64 beid=2;
  int64 ptyid=3;
  string appid=4;
  string appsecret=5;
  string title=6;
}

service Common {
  rpc GetAppConfig(AppConfigReq) returns(AppConfigResp);
  rpc GetBaseApp(BaseAppReq) returns(BaseAppResp);
}
```


### gotcl generates rpc service


```bash
➜  rpc goctl rpc proto -src common.proto -dir .
protoc  -I=/Users/jackluo/works/blogs/datacenter/common/rpc common.proto --go_out=plugins=grpc:/Users/jackluo/works/blogs/datacenter/common/rpc/common
Done.
```


```
➜ rpc tree
.
├── common
│  └── common.pb.go
├── common.go
├── common.proto
├── commonclient
│  └── common.go
├── etc
│  └── common.yaml
└── internal
├── config
│  └── config.go
├── logic
│  ├── getappconfiglogic.go
│  └── getbaseapplogic.go
├── server
│  └── commonserver.go
└── svc
└── servicecontext.go

8 directories, 10 files
```


Basically, all the catalog specifications and structure are generated, so there is no need to worry about the project catalog, how to put it, and how to organize it.


Take a look at the configuration information, which can write mysql and other redis information:


```yaml
Name: common.rpc
ListenOn: 127.0.0.1:8081
Mysql:
  DataSource: root:admin@tcp(127.0.0.1:3306)/datacenter?charset=utf8&parseTime=true&loc=Asia%2FShanghai
CacheRedis:
- Host: 127.0.0.1:6379
  Pass:
  Type: node  
Etcd:
  Hosts:
  - 127.0.0.1:2379
  Key: common.rpc
```


Let's add database services:


```
➜  rpc cd ..
➜  common ls
rpc
➜  common pwd
/Users/jackluo/works/blogs/datacenter/common
➜  common goctl model mysql datasource -url="root:admin@tcp(127.0.0.1:3306)/datacenter" -table="base_app" -dir ./model -c
Done.
➜  common tree
.
├── model
│   ├── baseappmodel.go
│   └── vars.go
└── rpc
    ├── common
    │   └── common.pb.go
    ├── common.go
    ├── common.proto
    ├── commonclient
    │   └── common.go
    ├── etc
    │   └── common.yaml
    └── internal
        ├── config
        │   └── config.go
        ├── logic
        │   ├── getappconfiglogic.go
        │   └── getbaseapplogic.go
        ├── server
        │   └── commonserver.go
        └── svc
            └── servicecontext.go

10 directories, 12 files
```


So the basic `rpc` is finished, and then we connect the rpc with the model and the api. This official document is already very detailed, here is just the code:


```go
➜  common cat rpc/internal/config/config.go
package config

import (
    "github.com/tal-tech/go-zero/core/stores/cache"
    "github.com/tal-tech/go-zero/zrpc"
)

type Config struct {
    zrpc.RpcServerConf
    Mysql struct {
        DataSource string
    }
    CacheRedis cache.ClusterConf
}
```


Modify in svc：


```go
➜  common cat rpc/internal/svc/servicecontext.go
package svc

import (
    "datacenter/common/model"
    "datacenter/common/rpc/internal/config"

    "github.com/tal-tech/go-zero/core/stores/sqlx"
)

type ServiceContext struct {
    c              config.Config
    AppConfigModel model.AppConfigModel
    BaseAppModel   model.BaseAppModel
}

func NewServiceContext(c config.Config) *ServiceContext {
    conn := sqlx.NewMysql(c.Mysql.DataSource)
    apm := model.NewAppConfigModel(conn, c.CacheRedis)
    bam := model.NewBaseAppModel(conn, c.CacheRedis)
    return &ServiceContext{
        c:              c,
        AppConfigModel: apm,
        BaseAppModel:   bam,
    }
}
```


The above code has already associated `rpc` with the `model` database, we will now associate `rpc` with `api`:


```go
➜  datacenter cat internal/config/config.go

package config

import (
    "github.com/tal-tech/go-zero/core/stores/cache"
    "github.com/tal-tech/go-zero/rest"
    "github.com/tal-tech/go-zero/zrpc"
)

type Config struct {
    rest.RestConf

    Auth struct {
        AccessSecret string
        AccessExpire int64
    }
    UserRpc   zrpc.RpcClientConf
    CommonRpc zrpc.RpcClientConf
    VotesRpc  zrpc.RpcClientConf

    CacheRedis cache.ClusterConf
}
```


Join the `svc` service：


```go
➜  datacenter cat internal/svc/servicecontext.go
package svc

import (
    "context"
    "datacenter/common/rpc/commonclient"
    "datacenter/internal/config"
    "datacenter/internal/middleware"
    "datacenter/shared"
    "datacenter/user/rpc/userclient"
    "datacenter/votes/rpc/votesclient"
    "fmt"
    "net/http"
    "time"

    "github.com/tal-tech/go-zero/core/logx"
    "github.com/tal-tech/go-zero/core/stores/cache"
    "github.com/tal-tech/go-zero/core/stores/redis"
    "github.com/tal-tech/go-zero/core/syncx"
    "github.com/tal-tech/go-zero/rest"
    "github.com/tal-tech/go-zero/zrpc"
    "google.golang.org/grpc"
)

type ServiceContext struct {
    Config           config.Config
    GreetMiddleware1 rest.Middleware
    GreetMiddleware2 rest.Middleware
    Usercheck        rest.Middleware
    UserRpc          userclient.User //用户
    CommonRpc        commonclient.Common
    VotesRpc         votesclient.Votes
    Cache            cache.Cache
    RedisConn        *redis.Redis
}

func timeInterceptor(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
    stime := time.Now()
    err := invoker(ctx, method, req, reply, cc, opts...)
    if err != nil {
        return err
    }

    fmt.Printf("timeout %s: %v\n", method, time.Now().Sub(stime))
    return nil
}
func NewServiceContext(c config.Config) *ServiceContext {

    ur := userclient.NewUser(zrpc.MustNewClient(c.UserRpc, zrpc.WithUnaryClientInterceptor(timeInterceptor)))
    cr := commonclient.NewCommon(zrpc.MustNewClient(c.CommonRpc, zrpc.WithUnaryClientInterceptor(timeInterceptor)))
    vr := votesclient.NewVotes(zrpc.MustNewClient(c.VotesRpc, zrpc.WithUnaryClientInterceptor(timeInterceptor)))
    //缓存
    ca := cache.NewCache(c.CacheRedis, syncx.NewSharedCalls(), cache.NewCacheStat("dc"), shared.ErrNotFound)
    rcon := redis.NewRedis(c.CacheRedis[0].Host, c.CacheRedis[0].Type, c.CacheRedis[0].Pass)
    return &ServiceContext{
        Config:           c,
        GreetMiddleware1: greetMiddleware1,
        GreetMiddleware2: greetMiddleware2,
        Usercheck:        middleware.NewUserCheckMiddleware().Handle,
        UserRpc:          ur,
        CommonRpc:        cr,
        VotesRpc:         vr,
        Cache:            ca,
        RedisConn:        rcon,
    }
}
```


Basically, we can call it in the file directory of `logic`:


```go
cat internal/logic/common/appinfologic.go

package logic

import (
    "context"

    "datacenter/internal/svc"
    "datacenter/internal/types"
    "datacenter/shared"

    "datacenter/common/model"
    "datacenter/common/rpc/common"

    "github.com/tal-tech/go-zero/core/logx"
)

type AppInfoLogic struct {
    logx.Logger
    ctx    context.Context
    svcCtx *svc.ServiceContext
}

func NewAppInfoLogic(ctx context.Context, svcCtx *svc.ServiceContext) AppInfoLogic {
    return AppInfoLogic{
        Logger: logx.WithContext(ctx),
        ctx:    ctx,
        svcCtx: svcCtx,
    }
}

func (l *AppInfoLogic) AppInfo(req types.Beid) (appconfig *common.BaseAppResp, err error) {

    err = l.svcCtx.Cache.GetCache(model.GetcacheBaseAppIdPrefix(req.Beid), appconfig)
    if err != nil && err == shared.ErrNotFound {
        appconfig, err = l.svcCtx.CommonRpc.GetBaseApp(l.ctx, &common.BaseAppReq{
            Beid: req.Beid,
        })
        if err != nil {
            return
        }
        err = l.svcCtx.Cache.SetCache(model.GetcacheBaseAppIdPrefix(req.Beid), appconfig)
    }

    return
}
```


In this way, it is basically connected, and basically there is no need to change the others. `UserRPC` and `VotesRPC` are similar, so I won't write them here.


## Reviews


`go-zero` is really fragrant, because it has a `goctl` tool, which can automatically generate all the code structure, we will no longer worry about the directory structure, how to organize it, and there is no architectural ability for several years It’s not easy to implement. What are the norms, concurrency, circuit breaker, no use at all, test and filter other, concentrate on realizing the business, like microservices, but also service discovery, a series of things, don’t care, because `go-zero` has been implemented internally.


I have written code for more than 10 years. The php I have been using before, the more famous ones are laravel and thinkphp, which are basically modular. Realizations like microservices are really costly, but you use go-zero. , You develop as simple as tune api interface, other service discovery, those do not need to pay attention at all, only need to pay attention to the business.


A good language, framework, and their underlying thinking are always high-efficiency and no overtime thinking. I believe that go-zero will improve the efficiency of you and your team or company. The author of go-zero said that they have a team dedicated to organizing the go-zero framework, and the purpose should be obvious, that is, to improve their own development efficiency, process flow, and standardization, which are the criteria for improving work efficiency, as we usually encounter When it comes to a problem or encounter a bug, the first thing I think of is not how to solve my bug, but whether there is a problem with my process, which of my process will cause the bug, and finally I believe in `go-zero `Can become the preferred framework for **microservice development**.


Finally, talk about the pits encountered:


- `grpc`



I used `grpc` for the first time, and then I encountered the problem that the field value is not displayed when some characters are empty:


It is realized by `jsonpb` in the official library of `grpc`. The official setting has a structure to realize the conversion of `protoc buffer` to JSON structure, and can configure the conversion requirements according to the fields.


- Cross-domain issues



It is set in `go-zero`, and it feels no effect. The big guy said that it was set through nginx, but later found that it still didn't work. Recently, I forcibly got a domain name, and I have time to solve it later.


- `sqlx`



The `sqlx` problem of `go-zero`, this really took a long time:


> `time.Time` is a data structure. Timestamp is used in the database. For example, my field is delete_at. The default database setting is null. When the result is inserted, it reports `Incorrect datetime value: '0000-00-00 'for column'deleted_at' at row 1"}` This error, the query time reported `deleted_at\": unsupported Scan, storing driver.Value type \u003cnil\u003e into type *time.Time"`
> 
> I removed this field decisively and added the label `.omitempty` above the field, which seems to be useful too, `db:".omitempty"`



The second is this `Conversion from collation utf8_general_ci into utf8mb4_unicode_ci`. The probable reason for this is that I like to use emj expressions now, and my mysql data cannot be recognized.


- data links



`mysql` still follows the original way, modify the encoding format of the configuration file, re-create the database, and set the database encoding to utf8mb4, and the sorting rule is `utf8mb4_unicode_ci`.


**In this case, all tables and string fields are in this encoding format. If you don't want all of them, you can set them separately. This is not the point. Because it is easy to set on Navicat, just click manually**。


Here comes the important point: Golang uses the `github.com/go-sql-driver/mysql` driver, which will connect to the `dsn` of `mysql` (because I am using gorm, dsn may be different from the native format. Too the same, but it’s okay, just pay attention to `charset` and `collation`)
`root:password@/name?parseTime=True&loc=Local&charset=utf8` is modified to:
`root:password@/name?parseTime=True&loc=Local&charset=utf8mb4&collation=utf8mb4_unicode_ci`

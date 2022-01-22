---
sidebar_position: 24
---

# go-zero 实现一个中台系统

> 作者：Jack Luo
> 
> 原文连接：https://www.cnblogs.com/jackluo/p/14148518.html

[TOC]

最近发现golang社区里出了一个新星的微服务框架，来自好未来，光看这个名字，就很有奔头，之前，也只是玩过go-micro，其实真正的还没有在项目中运用过，只是觉得 微服务，grpc 这些很高大尚，还没有在项目中，真正的玩过，我看了一下官方提供的工具真的很好用，只需要定义好，舒适文件jia结构 都生成了，只需要关心业务，加上最近 有个投票的活动，加上最近这几年中台也比较火，所以决定玩一下，

> 开源地址: [https://github.com/jackluo2012/datacenter](https://github.com/jackluo2012/datacenter)

先聊聊中台架构思路吧：

![](https://img2020.cnblogs.com/blog/203395/202012/203395-20201217094615171-335437652.jpg)

中台的概念大概就是把一个一个的app 统一起来，反正我是这样理解的。

先聊用户服务吧，现在一个公司有很多的公众号、小程序、微信的、支付宝的，还有 xxx xxx，很多的平台，每次开发的时候，我们总是需要做用户登陆的服务，不停的复制代码，然后我们就在思考能不能有一套独立的用户服务，只需要告诉我你需要传个你要登陆的平台(比如微信)，微信登陆，需要的是客户端返回给服务端一个code ，然后服务端拿着这个code去微信获取用户信息，反正大家都明白。

我们决定，将所有的信息弄到配置公共服务中去，里面再存微信、支付宝以及其它平台的appid、appkey、还有支付的appid、appkey，这样就写一套。

---

最后说说实现吧，整个就一个repo：

- 网关，我们用的是: go-zero的Api服务
- 其它它的是服务，我们就是用的go-zero的rpc服务

看下目录结构

![](https://img2020.cnblogs.com/blog/203395/202012/203395-20201209110504600-317546535.png)

整个项目完成，我一个人操刀，写了1个来星期，我就实现了上面的中台系统。

## datacenter-api服务


先看官方文档 [https://go-zero.dev/cn/](https://go-zero.dev/cn/)

我们先把网关搭建起来：

```shell
➜ blogs mkdir datacenter && cd datacenter
➜ datacenter go mod init datacenter
go: creating new go.mod: module datacenter
➜ datacenter
```

查看book目录：


```
➜  datacenter tree
.
└── go.mod

0 directories, 1 file
```


### 创建api文件


```
➜  datacenter goctl api -o datacenter.api
Done.
➜  datacenter tree
.
├── datacenter.api
├── user.api  #用户
├── votes.api #投票
├── search.api #搜索
├── questions.api #问答
└── go.mod
```


### 定义api服务


分别包含了上面的 **公共服务**，**用户服务**，**投票活动服务**

datacenter.api的内容:

```
info(
	title: "中台系统"// TODO: add title
	desc: "中台系统"// TODO: add description
	author: "jackluo"
	email: "net.webjoy@gmail.com"
)

import "user.api"
import "votes.api"
import "search.api"
import "questions.api"

//获取 应用信息
type Beid {
	Beid int64 `json:"beid"`
}
type Token {
	Token string `json:"token"`
}
type WxTicket {
	Ticket string `json:"ticket"`
}
type Application {
	Sname       string `json:"Sname"`       //名称
	Logo        string `json:"logo"`        // login
	Isclose     int64  `json:"isclose"`     //是否关闭
	Fullwebsite string `json:"fullwebsite"` // 全站名称
}
type SnsReq {
	Beid
	Ptyid   int64  `json:"ptyid"`    //对应平台
	BackUrl string `json:"back_url"` //登陆返回的地址
}
type SnsResp {
	Beid
	Ptyid    int64  `json:"ptyid"`     //对应平台
	Appid    string `json:"appid"`     //sns 平台的id
	Title    string `json:"title"`     //名称
	LoginUrl string `json:"login_url"` //微信登陆的地址
}

type WxShareResp {
	Appid     string `json:"appid"`
	Timestamp int64  `json:"timestamp"`
	Noncestr  string `json:"noncestr"`
	Signature string `json:"signature"`
}

@server(
	group: common
)
service datacenter-api {
	@doc(
		summary: "获取站点的信息"
	)
	@handler appInfo
	get /common/appinfo (Beid) returns (Application)
	@doc(
		summary: "获取站点的社交属性信息"
	)
	@handler snsInfo
	post /common/snsinfo (SnsReq) returns (SnsResp)
	
	//获取分享的
	@handler wxTicket
	post /common/wx/ticket (SnsReq) returns (WxShareResp)
	
}

//上传需要登陆
@server(
	jwt: Auth
	group: common
)
service datacenter-api {
	@doc(
		summary: "七牛上传凭证"
	)
	@handler qiuniuToken
	post /common/qiuniu/token (Beid) returns (Token)
}
```
user.api内容

```
//注册请求
type RegisterReq struct {
	// TODO: add members here and delete this comment
	Mobile   string `json:"mobile"` //基本一个手机号码就完事
	Password string `json:"password"`
	Smscode	string `json:"smscode"` //短信码
}
//登陆请求
type LoginReq struct{
	Mobile   string `json:"mobile"`
	Type int64 `json:"type"`	//1.密码登陆，2.短信登陆
	Password string `json:"password"`
}
//微信登陆
type WxLoginReq struct {
	Beid	  int64  `json:"beid"` //应用id
	Code string `json:"code"` //微信登陆密钥
	Ptyid	  int64  `json:"ptyid"` //对应平台
}

//返回用户信息
type UserReply struct {
	Auid       int64  `json:"auid"`
	Uid       int64  `json:"uid"`
	Beid	  int64  `json:"beid"` //应用id
	Ptyid	  int64  `json:"ptyid"` //对应平台
	Username string `json:"username"`
	Mobile   string `json:"mobile"`
	Nickname string `json:"nickname"`
	Openid string `json:"openid"`
	Avator string `json:"avator"`
	JwtToken
}
//返回APPUser
type AppUser struct{
	Uid       int64  `json:"uid"`
	Auid       int64  `json:"auid"`
	Beid	  int64  `json:"beid"` //应用id
	Ptyid	  int64  `json:"ptyid"` //对应平台
	Nickname string `json:"nickname"`
	Openid string `json:"openid"`
	Avator string `json:"avator"`
}

type LoginAppUser struct{
	Uid       int64  `json:"uid"`
	Auid       int64  `json:"auid"`
	Beid	  int64  `json:"beid"` //应用id
	Ptyid	  int64  `json:"ptyid"` //对应平台
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
	Beid	  int64  `json:"beid"` //应用id
	Ptyid	  int64  `json:"ptyid"` //对应平台
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
service datacenter-api {
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
service datacenter-api {
	@handler userInfo
	get /user/dc/info (UserReq) returns (UserReply)
}
```
votes.api 投票内容
```
// 投票活动api


type Actid struct {
	Actid       int64  `json:"actid"` //活动id
}

type VoteReq struct {
	Aeid       int64  `json:"aeid"` // 作品id
	Actid
}
type VoteResp struct {
	VoteReq
	Votecount       int64  `json:"votecount"` //投票票数
	Viewcount       int64  `json:"viewcount"` //浏览数
}


// 活动返回的参数

type ActivityResp struct {
	Actid       	int64  `json:"actid"`
	Title       	string  `json:"title"` //活动名称
	Descr       	string  `json:"descr"` //活动描述
	StartDate       int64  `json:"start_date"` //活动时间
	EnrollDate      int64  `json:"enroll_date"` //投票时间
	EndDate       	int64  `json:"end_date"` //活动结束时间
	Votecount       int64  `json:"votecount"` //当前活动的总票数
	Viewcount       int64  `json:"viewcount"` //当前活动的总浏览数
	Type			int64 `json:"type"` //投票方式
	Num				int64 `json:"num"` //投票几票
}
//报名


type EnrollReq struct {
	Actid
	Name       	string  `json:"name"` // 名称
	Address       	string  `json:"address"` //地址
	Images       	[]string  `json:"images"` //作品图片
	Descr       	string  `json:"descr"` // 作品描述
}
// 作品返回

type EnrollResp struct {
	Actid
	Aeid		int64 `json:"aeid"` // 作品id
	Name       	string  `json:"name"` // 名称
	Address       	string  `json:"address"` //地址
	Images       	[]string  `json:"images"` //作品图片
	Descr       	string  `json:"descr"` // 作品描述
	Votecount       int64  `json:"votecount"` //当前活动的总票数
	Viewcount       int64  `json:"viewcount"` //当前活动的总浏览数
	
}


@server(
	group: votes
)
service datacenter-api {
	@doc(
		summary: "获取活动的信息"
	)
	@handler activityInfo
	get /votes/activity/info (Actid) returns (ActivityResp)
	@doc(
		summary: "活动访问+1"
	)
	@handler activityIcrView
	get /votes/activity/view (Actid) returns (ActivityResp)
	@doc(
		summary: "获取报名的投票作品信息"
	)
	@handler enrollInfo
	get /votes/enroll/info (VoteReq) returns (EnrollResp)
	@doc(
		summary: "获取报名的投票作品列表"
	)
	@handler enrollLists
	get /votes/enroll/lists (Actid)	returns(EnrollResp)
}

@server(
	jwt: Auth
	group: votes
	middleware: Usercheck
)
service datacenter-api {
	@doc(
		summary: "投票"
	)
	@handler vote
	post /votes/vote (VoteReq) returns (VoteResp)
	@handler enroll
	post /votes/enroll (EnrollReq) returns (EnrollResp)
}

```

questions.api 问答内容:
```
// 问答 抽奖 开始
@server(
	group: questions
)
service datacenter-api {
	@doc(
		summary: "获取活动的信息"
	)
	@handler activitiesInfo
	get /questions/activities/info (Actid) returns (ActivityResp)
	@doc(
		summary: "获取奖品信息"
	)
	@handler awardInfo
	get /questions/award/info (Actid) returns (ActivityResp)

	@handler awardList
	get /questions/award/list (Actid) returns (ActivityResp)
	
}
type AnswerReq struct {
	ActivityId	int64 `json:"actid"` 
	Answers	string `json:"answers"` 
	Score	string `json:"score"`
}
type QuestionsAwardReq struct {
	ActivityId	int64 `json:"actid"` 
	AnswerId	int64 `json:"answerid"` 
}
type AnswerResp struct {
	Answers	string `json:"answers"` 
	Score	string `json:"score"`
}
type AwardConvertReq struct {
	UserName	string `json:"username"` 
	Phone		string `json:"phone"` 
	LotteryId	int64 `json:"lotteryid"` 
}


@server(
	jwt: Auth
	group: questions
	middleware: Usercheck
)
service datacenter-api {
	@doc(
		summary: "获取题目"
	)
	@handler lists
	get /questions/lists (VoteReq) returns (AnswerResp)
	@doc(
		summary: "提交答案"
	)
	@handler change
	post /questions/change (AnswerReq) returns (VoteResp)

	@doc(
		summary: "获取分数"
	)
	@handler grade
	get /questions/grade (VoteReq) returns (VoteResp)

	@doc(
		summary: "开始转盘"
	)
	@handler turntable
	post /questions/lottery/turntable (EnrollReq) returns (EnrollResp)
	@doc(
		summary: "填写中奖信息人"
	)
	@handler lottery
	post /questions/lottery/convert (AwardConvertReq) returns (EnrollResp)
}


// 问答 抽奖 结束
```
search.api 搜索
```


type SearchReq struct {
	Keyword string `json:"keyword"`
	Page string `json:"page"`
	Size string `json:"size"`
}
type SearchResp struct {
	Data []ArticleReq `json:"data"`
}

type ArticleReq struct{
	NewsId string `json:"NewsId"`
	NewsTitle string `json:"NewsTitle"`
	ImageUrl string `json:"ImageUrl"`
}


@server(
	group: search
	middleware: Admincheck
)
service datacenter-api {
	@doc(
		summary: "搜索"
	)
	@handler article
	get /search/article (SearchReq) returns (SearchResp)
	@handler articleInit
	get /search/articel/init (SearchReq) returns (SearchResp)
	@handler articleStore
	post /search/articel/store (ArticleReq) returns (ArticleReq)
}

```

上面基本上写就写的API及文档的思路


### 生成datacenter api服务


```
➜  datacenter goctl api go -api datacenter.api -dir .
Done.
➜  datacenter treer
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


我们打开 `etc/datacenter-api.yaml` 把必要的配置信息加上


```yaml
Name: datacenter-api
Log:
  Mode: console
Host: 0.0.0.0
Port: 8857
Auth:
  AccessSecret: 你的jwtwon Secret
  AccessExpire: 86400
CacheRedis:
- Host: 127.0.0.1:6379
  Pass: 密码
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


上面的 `UserRpc`， `CommonRpc` ,还有 `VotesRpc` 这些我先写上，后面再来慢慢加。


我们先来写 `CommonRpc` 服务。


## CommonRpc服务


### 新建项目目录


```
➜  datacenter mkdir -p common/rpc && cd common/rpc
```


直接就新建在了，datacenter目录中，因为common 里面，可能以后会不只会提供rpc服务，可能还有api的服务,所以又加了rpc目录


### goctl创建模板


```
➜  rpc goctl rpc template -o=common.proto
➜  rpc ls
common.proto
```


往里面填入内容：


```protobufbuf
➜  rpc cat common.proto
syntax = "proto3";

option go_package = "common";

package common;


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

// 请求的api
message AppConfigReq {
  int64 beid=1;
  int64 ptyid=2;
}

// 返回的值
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


### gotcl生成rpc服务


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


基本上，就把所有的目录规范和结构的东西都生成了，就不用纠结项目目录了，怎么放了，怎么组织了。


看一下，配置信息，里面可以写入mysql和其它redis的信息：


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


我们再来加上数据库服务：


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


这样基本的一个 `rpc` 就写完了，然后我们将rpc 和model 还有api串连起来，这个官方的文档已经很详细了，这里就只是贴一下代码：


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


再在svc中修改：


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


上面的代码已经将 `rpc` 和 `model` 数据库关联起来了，我们现在再将 `rpc` 和 `api` 关联起来：


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


加入 `svc` 服务中：


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

    fmt.Printf("调用 %s 方法 耗时: %v\n", method, time.Now().Sub(stime))
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


这样基本上，我们就可以在 `logic` 的文件目录中调用了：


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

    //检查 缓存中是否有值
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


这样，基本就连接起来了，其它基本上就不用改了，`UserRPC`， `VotesRPC` 类似，这里就不在写了。


## 使用心得


`go-zero` 的确香，因为它有一个 `goctl` 的工具，他可以自动的把代码结构全部的生成好，我们就不再去纠结，目录结构 ，怎么组织，没有个好几年的架构能力是不好实现的，有什么规范那些，并发，熔断，完全不用，考滤其它的，专心的实现业务就好，像微服务，还要有服务发现，一系列的东西，都不用关心，因为 `go-zero` 内部已经实现了。


我写代码也写了有10多年了，之前一直用的 php，比较出名的就 laravel，thinkphp，基本上就是模块化的,像微服那些实现直来真的有成本，但是你用上go-zero，你就像调api接口一样简单的开发，其它什么服务发现，那些根本就不用关注了，只需要关注业务。


一个好的语言，框架，他们的底层思维，永远都是效率高，不加班的思想，我相信go-zero会提高你和你团队或是公司的效率。go-zero的作者说，他们有个团队专门整理go-zero框架，目的也应该很明显，那就是提高，他们自己的开发效率，流程化，标准化，是提高工作效率的准则，像我们平时遇到了问题，或是遇到了bug，我第一个想到的不是怎么去解决我的bug，而是在想我的流程是不是有问题，我的哪个流程会导致bug，最后我相信 `go-zero` 能成为 **微服务开发** 的首选框架。


最后说说遇到的坑吧：


- `grpc`



`grpc` 本人第一次用，然后就遇到了，有些字符为空时，字段值不显示的问题：


通过 `grpc` 官方库中的 `jsonpb` 来实现，官方在它的设定中有一个结构体用来实现 `protoc buffer` 转换为JSON结构，并可以根据字段来配置转换的要求。


- 跨域问题



`go-zero` 中设置了，感觉没有效果，大佬说通过nginx 设置，后面发现还是不行，最近强行弄到了一个域名下，后面有时间再解决。


- `sqlx`



`go-zero` 的 `sqlx` 问题，这个真的费了很长的时间：


> `time.Time` 这个数据结构，数据库中用的是 timestamp 这个 比如我的字段 是delete_at 默认数库设置的是null ，结果插入的时候，就报了 `Incorrect datetime value: '0000-00-00' for column 'deleted_at' at row 1"}` 这个错，查询的时候报 `deleted_at\": unsupported Scan, storing driver.Value type \u003cnil\u003e into type *time.Time"`
> 后面果断去掉了这个字段，字段上面加上 `.omitempty` 这个标签，好像也有用，`db:".omitempty"`



其次就是这个 `Conversion from collation utf8_general_ci into utf8mb4_unicode_ci`，这个导致的大概原因是，现在都喜欢用emj表情了，mysql数据识别不了。


- 数据连接



`mysql` 这边照样按照原始的方式,将配置文件修改编码格式，重新创建数据库，并且设置数据库编码为utf8mb4，排序规则为 `utf8mb4_unicode_ci`。


**这样的话,所有的表还有string字段都是这个编码格式,如果不想所有的都是,可以单独设置,这个不是重点.因为在navicat上都好设置,手动点一下就行了**。


重点来了：golang中使用的是 `github.com/go-sql-driver/mysql` 驱动，将连接 `mysql`的 `dsn`（因为我这使用的是gorm，所以dsn可能跟原生的格式不太一样，不过没关系， 只需要关注 `charset` 和 `collation` 就行了）
`root:password@/name?parseTime=True&loc=Local&charset=utf8` 修改为：
`root:password@/name?parseTime=True&loc=Local&charset=utf8mb4&collation=utf8mb4_unicode_ci`

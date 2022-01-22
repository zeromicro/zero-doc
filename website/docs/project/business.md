---
sidebar_position: 4
---

# 业务开发

本章节我们用一个简单的示例去演示一下go-zero中的一些基本功能。

## 演示工程下载
在正式进入后续文档叙述前，可以先留意一下这里的源码，后续我们会基于这份源码进行功能的递进式演示，
而不是完全从0开始，如果你从[快速入门](../quick-start/concept.md)章节过来，这份源码结构对你来说不是问题。

点击<a href="https://zeromicro.github.io/go-zero-pages/resource/book.zip">这里下载</a>演示工程基础源码

## 演示工程说明

### 场景
程序员小明需要借阅一本《西游记》，在没有线上图书管理系统的时候，他每天都要去图书馆前台咨询图书馆管理员，
* 小明：你好，请问今天《西游记》的图书还有吗？
* 管理员：没有了，明天再来看看吧。

过了一天，小明又来到图书馆，问：
* 小明：你好，请问今天《西游记》的图书还有吗？
* 管理员：没有了，你过两天再来看看吧。

就这样经过多次反复，小明也是徒劳无功，浪费大量时间在来回的路上，于是终于忍受不了落后的图书管理系统，
他决定自己亲手做一个图书查阅系统。

### 预期实现目标
* 用户登录
  依靠现有学生系统数据进行登录
* 图书检索
  根据图书关键字搜索图书，查询图书剩余数量。

### 系统分析

#### 服务拆分
* user
    * api 提供用户登录协议
    * rpc 供search服务访问用户数据
* search
    * api 提供图书查询协议

:::tip
这个微小的图书借阅查询系统虽然小，从实际来讲不太符合业务场景，但是仅上面两个功能，已经满足我们对go-zero api/rpc的场景演示了，
后续为了满足更丰富的go-zero功能演示，会在文档中进行业务插入即相关功能描述。这里仅用一个场景进行引入。
 
注意：user中的sql语句请自行创建到db中去，更多准备工作见**[准备工作](prepare.md)**
 
添加一些预设的用户数据到数据库，便于后面使用，为了篇幅，演示工程不对插入数据这种操作做详细演示。
:::

#### 参考预设数据
```sql
INSERT INTO `user` (number,name,password,gender)values ('666','小明','123456','男');
```

## 目录拆分
目录拆分是指配合go-zero的最佳实践的目录拆分，这和微服务拆分有着关联，在团队内部最佳实践中，
我们按照业务横向拆分，将一个系统拆分成多个子系统，每个子系统应拥有独立的持久化存储，缓存系统。
如一个商城系统需要有用户系统(user)，商品管理系统(product)，订单系统(order)，购物车系统(cart)，结算中心系统(pay)，售后系统(afterSale)等组成。

### 系统结构分析
在上文提到的商城系统中，每个系统在对外（http）提供服务的同时，也会提供数据给其他子系统进行数据访问的接口（rpc），因此每个子系统可以拆分成一个服务，而且对外提供了两种访问该系统的方式api和rpc，因此，
以上系统按照目录结构来拆分有如下结构:

```text
.
├── afterSale
│   ├── api
│   └── rpc
├── cart
│   ├── api
│   └── rpc
├── order
│   ├── api
│   └── rpc
├── pay
│   ├── api
│   └── rpc
├── product
│   ├── api
│   └── rpc
└── user
    ├── api
    └── rpc
```

### rpc调用链建议
在设计系统时，尽量做到服务之间调用链是单向的，而非循环调用，例如：order服务调用了user服务，而user服务反过来也会调用order的服务，
当其中一个服务启动故障，就会相互影响，进入死循环，你order认为是user服务故障导致的，而user认为是order服务导致的，如果有大量服务存在相互调用链，
则需要考虑服务拆分是否合理。

### 常见服务类型的目录结构
在上述服务中，仅列举了api/rpc服务，除此之外，一个服务下还可能有其他更多服务类型，如rmq（消息处理系统），cron（定时任务系统），script（脚本）等，
因此一个服务下可能包含以下目录结构：
```text
user
    ├── api //  http访问服务，业务需求实现
    ├── cronjob // 定时任务，定时数据更新业务
    ├── rmq // 消息处理系统：mq和dq，处理一些高并发和延时消息业务
    ├── rpc // rpc服务，给其他子系统提供基础数据访问
    └── script // 脚本，处理一些临时运营需求，临时数据修复
```

### 完整工程目录结构示例
```text
mall // 工程名称
├── common // 通用库
│   ├── randx
│   └── stringx
├── go.mod
├── go.sum
└── service // 服务存放目录
    ├── afterSale
    │   ├── api
    │   └── model
    │   └── rpc
    ├── cart
    │   ├── api
    │   └── model
    │   └── rpc
    ├── order
    │   ├── api
    │   └── model
    │   └── rpc
    ├── pay
    │   ├── api
    │   └── model
    │   └── rpc
    ├── product
    │   ├── api
    │   └── model
    │   └── rpc
    └── user
        ├── api
        ├── cronjob
        ├── model
        ├── rmq
        ├── rpc
        └── script
```

## model生成
首先，下载好[演示工程](https://go-zero.dev/cn/resource/book.zip) 后，我们以user的model来进行代码生成演示。

model是服务访问持久化数据层的桥梁，业务的持久化数据常存在于mysql，mongo等数据库中，我们都知道，对于一个数据库的操作莫过于CURD，
而这些工作也会占用一部分时间来进行开发，我曾经在编写一个业务时写了40个model文件，根据不同业务需求的复杂性，平均每个model文件差不多需要
10分钟，对于40个文件来说，400分钟的工作时间，差不多一天的工作量，而goctl工具可以在10秒钟来完成这400分钟的工作。

### 准备工作
进入演示工程book，找到user/model下的user.sql文件，将其在你自己的数据库中执行建表。

### 代码生成(带缓存)
#### 方式一(ddl)
进入`service/user/model`目录，执行命令
```shell
$ cd service/user/model
$ goctl model mysql ddl -src user.sql -dir . -c
```
```text
Done.
```



#### 方式二(datasource)
```shell
$ goctl model mysql datasource -url="$datasource" -table="user" -c -dir .
```
```text
Done.
```
:::tip
$datasource为数据库连接地址
:::

#### 方式三(intellij 插件)
在Goland中，右键`user.sql`，依次进入并点击`New`->`Go Zero`->`Model Code`即可生成，或者打开`user.sql`文件，
进入编辑区，使用快捷键`Command+N`（for mac OS）或者 `alt+insert`（for windows），选择`Mode Code`即可

![model生成](https://zeromicro.github.io/go-zero-pages/resource/intellij-model.png)

:::tip
intellij插件生成需要安装goctl插件
:::

### 验证生成的model文件
查看tree
```shell
$ tree，依次点击进入 New->Go Zero->Api Code
```
```text
.
├── user.sql
├── usermodel.go
└── vars.go
```

## api文件编写

### 编写user.api文件
```shell
$ vim service/user/cmd/api/user.api  
```
```text
type (
    LoginReq {
        Username string `json:"username"`
        Password string `json:"password"`
    }

    LoginReply {
        Id           int64 `json:"id"`
        Name         string `json:"name"`
        Gender       string `json:"gender"`
        AccessToken  string `json:"accessToken"`
        AccessExpire int64 `json:"accessExpire"`
        RefreshAfter int64 `json:"refreshAfter"`
    }
)

service user-api {
    @handler login
    post /user/login (LoginReq) returns (LoginReply)
}
```
### 生成api服务
#### 方式一

```shell
$ cd book/service/user/cmd/api
$ goctl api go -api user.api -dir . 
```
```text
Done.
```

#### 方式二

在 `user.api` 文件右键，依次点击进入 `New`->`Go Zero`->`Api Code` ，进入目标目录选择，即api源码的目标存放目录，默认为user.api所在目录，选择好目录后点击OK即可。
![api生成](https://zeromicro.github.io/go-zero-pages/resource/goctl-api.png)
![api生成目录选择](https://zeromicro.github.io/go-zero-pages/resource/goctl-api-select.png)

#### 方式三

打开user.api，进入编辑区,使用快捷键`Command+N`（for mac OS）或者 `alt+insert`（for windows），选择`Api Code`，同样进入目录选择弹窗，选择好目录后点击OK即可。


## 业务编码

前面一节，我们已经根据初步需求编写了user.api来描述user服务对外提供哪些服务访问，在本节我们接着前面的步伐，
通过业务编码来讲述go-zero怎么在实际业务中使用。

### 添加Mysql配置
```shell
$ vim service/user/cmd/api/internal/config/config.go
```
```go
package config

import "github.com/tal-tech/go-zero/rest"

type Config struct {
    rest.RestConf
    Mysql struct{
        DataSource string
    }
    
    CacheRedis cache.CacheConf
}
```

### 完善yaml配置
```shell
$ vim service/user/cmd/api/etc/user-api.yaml
```
```yaml
Name: user-api
Host: 0.0.0.0
Port: 8888
Mysql:
  DataSource: $user:$password@tcp($url)/$db?charset=utf8mb4&parseTime=true&loc=Asia%2FShanghai
CacheRedis:
  - Host: $host
    Pass: $pass
    Type: node
```

:::tip
$user: mysql数据库user
 
$password: mysql数据库密码
  
$url: mysql数据库连接地址
 
$db: mysql数据库db名称，即user表所在database
 
$host: redis连接地址 格式：ip:port，如:127.0.0.1:6379
 
$pass: redis密码
:::

### 完善服务依赖
```shell
$ vim service/user/cmd/api/internal/svc/servicecontext.go
```
```go
type ServiceContext struct {
    Config    config.Config
    UserModel model.UserModel
}

func NewServiceContext(c config.Config) *ServiceContext {
    conn:=sqlx.NewMysql(c.Mysql.DataSource)
    return &ServiceContext{
        Config: c,
        UserModel: model.NewUserModel(conn,c.CacheRedis),
    }
}
```
### 填充登录逻辑
```shell
$ vim service/user/cmd/api/internal/logic/loginlogic.go
```

```go
func (l *LoginLogic) Login(req types.LoginReq) (*types.LoginReply, error) {
    if len(strings.TrimSpace(req.Username)) == 0 || len(strings.TrimSpace(req.Password)) == 0 {
        return nil, errors.New("参数错误")
    }
    
    userInfo, err := l.svcCtx.UserModel.FindOneByNumber(req.Username)
    switch err {
    case nil:
    case model.ErrNotFound:
        return nil, errors.New("用户名不存在")
    default:
        return nil, err
    }
    
    if userInfo.Password != req.Password {
        return nil, errors.New("用户密码不正确")
    }
    
    // ---start---
    now := time.Now().Unix()
    accessExpire := l.svcCtx.Config.Auth.AccessExpire
    jwtToken, err := l.getJwtToken(l.svcCtx.Config.Auth.AccessSecret, now, l.svcCtx.Config.Auth.AccessExpire, userInfo.Id)
    if err != nil {
        return nil, err
    }
    // ---end---
    
    return &types.LoginReply{
        Id:           userInfo.Id,
        Name:         userInfo.Name,
        Gender:       userInfo.Gender,
        AccessToken:  jwtToken,
        AccessExpire: now + accessExpire,
        RefreshAfter: now + accessExpire/2,
    }, nil
}  
```

## jwt鉴权

### 概述
> JSON Web令牌（JWT）是一个开放标准（RFC 7519），它定义了一种紧凑而独立的方法，用于在各方之间安全地将信息作为JSON对象传输。由于此信息是经过数字签名的，因此可以被验证和信任。可以使用秘密（使用HMAC算法）或使用RSA或ECDSA的公钥/私钥对对JWT进行签名。

### 什么时候应该使用JWT
* 授权：这是使用JWT的最常见方案。一旦用户登录，每个后续请求将包括JWT，从而允许用户访问该令牌允许的路由，服务和资源。单一登录是当今广泛使用JWT的一项功能，因为它的开销很小并且可以在不同的域中轻松使用。

* 信息交换：JSON Web令牌是在各方之间安全地传输信息的一种好方法。因为可以对JWT进行签名（例如，使用公钥/私钥对），所以您可以确保发件人是他们所说的人。此外，由于签名是使用标头和有效负载计算的，因此您还可以验证内容是否未被篡改。

### 为什么要使用JSON Web令牌
由于JSON不如XML冗长，因此在编码时JSON的大小也较小，从而使JWT比SAML更为紧凑。这使得JWT是在HTML和HTTP环境中传递的不错的选择。

在安全方面，只能使用HMAC算法由共享机密对SWT进行对称签名。但是，JWT和SAML令牌可以使用X.509证书形式的公用/专用密钥对进行签名。与签署JSON的简单性相比，使用XML Digital Signature签署XML而不引入模糊的安全漏洞是非常困难的。

JSON解析器在大多数编程语言中都很常见，因为它们直接映射到对象。相反，XML没有自然的文档到对象的映射。与SAML断言相比，这使使用JWT更加容易。

关于用法，JWT是在Internet规模上使用的。这突显了在多个平台（尤其是移动平台）上对JSON Web令牌进行客户端处理的简便性。

:::tip
以上内容全部来自[jwt官网介绍](https://jwt.io/introduction)
:::


### go-zero中怎么使用jwt
jwt鉴权一般在api层使用，我们这次演示工程中分别在user api登录时生成jwt token，在search api查询图书时验证用户jwt token两步来实现。

#### user api生成jwt token
接着[业务编码](business.md)章节的内容，我们完善上一节遗留的`getJwtToken`方法，即生成jwt token逻辑

##### 添加配置定义和yaml配置项
```shell
$ vim service/user/cmd/api/internal/config/config.go
```
```go
type Config struct {
	rest.RestConf
	Mysql struct{
		DataSource string
	}
	CacheRedis cache.CacheConf
	Auth      struct {
		AccessSecret string
		AccessExpire int64
	}
}
```
```shell
$ vim service/user/cmd/api/etc/user-api.yaml
```
```yaml
Name: user-api
Host: 0.0.0.0
Port: 8888
Mysql:
  DataSource: $user:$password@tcp($url)/$db?charset=utf8mb4&parseTime=true&loc=Asia%2FShanghai
CacheRedis:
  - Host: $host
    Pass: $pass
    Type: node
Auth:
  AccessSecret: $AccessSecret
  AccessExpire: $AccessExpire
```

:::tip
$AccessSecret：生成jwt token的密钥，最简单的方式可以使用一个uuid值。
 
$AccessExpire：jwt token有效期，单位：秒
:::


```shell
$ vim service/user/cmd/api/internal/logic/loginlogic.go
```

```go
func (l *LoginLogic) getJwtToken(secretKey string, iat, seconds, userId int64) (string, error) {
  claims := make(jwt.MapClaims)
  claims["exp"] = iat + seconds
  claims["iat"] = iat
  claims["userId"] = userId
  token := jwt.New(jwt.SigningMethodHS256)
  token.Claims = claims
  return token.SignedString([]byte(secretKey))
}
```

#### search api使用jwt token鉴权
##### 编写search.api文件
```shell
$ vim service/search/cmd/api/search.api
```
```text
type (
    SearchReq {
        // 图书名称
        Name string `form:"name"`
    }

    SearchReply {
        Name string `json:"name"`
        Count int `json:"count"`
    }
)

@server(
    jwt: Auth
)
service search-api {
    @handler search
    get /search/do (SearchReq) returns (SearchReply)
}

service search-api {
    @handler ping
    get /search/ping
}
```

:::tip
`jwt: Auth`：开启jwt鉴权
 
如果路由需要jwt鉴权，则需要在service上方声明此语法标志，如上文中的` /search/do`
 
不需要jwt鉴权的路由就无需声明，如上文中`/search/ping`
:::

##### 生成代码
前面已经描述过有三种方式去生成代码，这里就不赘述了。


##### 添加yaml配置项
```shell
$ vim service/search/cmd/api/etc/search-api.yaml
```
```yaml
Name: search-api
Host: 0.0.0.0
Port: 8889
Auth:
  AccessSecret: $AccessSecret
  AccessExpire: $AccessExpire

```

:::tip
$AccessSecret：这个值必须要和user api中声明的一致。
 
 $AccessExpire: 有效期
 
这里修改一下端口，避免和user api端口`8888`冲突
:::

#### 验证 jwt token
* 启动user api服务，登录
    ```shell
    $ cd service/user/cmd/api
    $ go run user.go -f etc/user-api.yaml
    ```
    ```text
    Starting server at 0.0.0.0:8888...
    ```
    ```shell
    $ curl -i -X POST \
      http://127.0.0.1:8888/user/login \
      -H 'content-type: application/json' \
      -d '{
        "username":"666",
        "password":"123456"
    }'
    ```
    ```text
    HTTP/1.1 200 OK
    Content-Type: application/json
    Date: Mon, 08 Feb 2021 10:37:54 GMT
    Content-Length: 251
    
    {"id":1,"name":"小明","gender":"男","accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MTI4NjcwNzQsImlhdCI6MTYxMjc4MDY3NCwidXNlcklkIjoxfQ.JKa83g9BlEW84IiCXFGwP2aSd0xF3tMnxrOzVebbt80","accessExpire":1612867074,"refreshAfter":1612823874}
    ```
* 启动search api服务，调用`/search/do`验证jwt鉴权是否通过
    ```shell
    $ go run search.go -f etc/search-api.yaml
    ```
    ```text
    Starting server at 0.0.0.0:8889...
    ```
    我们先不传jwt token，看看结果
    ```shell
    $ curl -i -X GET \
      'http://127.0.0.1:8889/search/do?name=%E8%A5%BF%E6%B8%B8%E8%AE%B0'
    ```
    ```text
    HTTP/1.1 401 Unauthorized
    Date: Mon, 08 Feb 2021 10:41:57 GMT
    Content-Length: 0
    ```
    很明显，jwt鉴权失败了，返回401的statusCode，接下来我们带一下jwt token（即用户登录返回的`accessToken`）
    ```shell
    $ curl -i -X GET \
      'http://127.0.0.1:8889/search/do?name=%E8%A5%BF%E6%B8%B8%E8%AE%B0' \
      -H 'authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MTI4NjcwNzQsImlhdCI6MTYxMjc4MDY3NCwidXNlcklkIjoxfQ.JKa83g9BlEW84IiCXFGwP2aSd0xF3tMnxrOzVebbt80'
    ```
    ```text
    HTTP/1.1 200 OK
    Content-Type: application/json
    Date: Mon, 08 Feb 2021 10:44:45 GMT
    Content-Length: 21

    {"name":"","count":0}
    ```

至此，jwt从生成到使用就演示完成了，jwt token的鉴权是go-zero内部已经封装了，你只需在api文件中定义服务时简单的声明一下即可。

#### 获取jwt token中携带的信息
go-zero从jwt token解析后会将用户生成token时传入的kv原封不动的放在http.Request的Context中，因此我们可以通过Context就可以拿到你想要的值
```shell
$ vim /service/search/cmd/api/internal/logic/searchlogic.go
```
添加一个log来输出从jwt解析出来的userId。
```go
func (l *SearchLogic) Search(req types.SearchReq) (*types.SearchReply, error) {
	logx.Infof("userId: %v",l.ctx.Value("userId"))// 这里的key和生成jwt token时传入的key一致
	return &types.SearchReply{}, nil
}
```
运行结果
```text
{"@timestamp":"2021-02-09T10:29:09.399+08","level":"info","content":"userId: 1"}
```

## 中间件使用
在上一节，我们演示了怎么使用jwt鉴权，相信你已经掌握了对jwt的基本使用，本节我们来看一下api服务中间件怎么使用。

### 中间件分类
在go-zero中，中间件可以分为路由中间件和全局中间件，路由中间件是指某一些特定路由需要实现中间件逻辑，其和jwt类似，没有放在`jwt:xxx`下的路由不会使用中间件功能，
而全局中间件的服务范围则是整个服务。

### 中间件使用
这里以`search`服务为例来演示中间件的使用

#### 路由中间件
* 重新编写`search.api`文件，添加`middleware`声明
    ```shell
    $ cd service/search/cmd/api
    $ vim search.api
    ```
    ```text
    type SearchReq struct {}
    
    type SearchReply struct {}
    
    @server(
        jwt: Auth
        middleware: Example // 路由中间件声明
    )
    service search-api {
        @handler search
        get /search/do (SearchReq) returns (SearchReply)
    }
    ```
* 重新生成api代码
    ```shell
    $ goctl api go -api search.api -dir . 
    ```
    ```text
    etc/search-api.yaml exists, ignored generation
    internal/config/config.go exists, ignored generation
    search.go exists, ignored generation
    internal/svc/servicecontext.go exists, ignored generation
    internal/handler/searchhandler.go exists, ignored generation
    internal/handler/pinghandler.go exists, ignored generation
    internal/logic/searchlogic.go exists, ignored generation
    internal/logic/pinglogic.go exists, ignored generation
    Done.
    ```
    生成完后会在`internal`目录下多一个`middleware`的目录，这里即中间件文件，后续中间件的实现逻辑也在这里编写。
*  完善资源依赖`ServiceContext`
    ```shell
    $ vim service/search/cmd/api/internal/svc/servicecontext.go
    ```
    ```go
    type ServiceContext struct {
        Config config.Config
        Example rest.Middleware
    }
    
    func NewServiceContext(c config.Config) *ServiceContext {
        return &ServiceContext{
            Config: c,
            Example: middleware.NewExampleMiddleware().Handle,
        }
    }
    ```
* 编写中间件逻辑
    这里仅添加一行日志，内容example middle，如果服务运行输出example middle则代表中间件使用起来了。
  
    ```shell
    $ vim service/search/cmd/api/internal/middleware/examplemiddleware.go
    ```
    ```go
    package middleware
    
    import "net/http"
    
    type ExampleMiddleware struct {
    }
    
    func NewExampleMiddleware() *ExampleMiddleware {
            return &ExampleMiddleware{}
    }
    
    func (m *ExampleMiddleware) Handle(next http.HandlerFunc) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
            // TODO generate middleware implement function, delete after code implementation
    
            // Passthrough to next handler if need
            next(w, r)
        }
    }
    ```
* 启动服务验证
    ```text
    {"@timestamp":"2021-02-09T11:32:57.931+08","level":"info","content":"example middle"}
    ```

#### 全局中间件
通过rest.Server提供的Use方法即可
```go
func main() {
	flag.Parse()

	var c config.Config
	conf.MustLoad(*configFile, &c)

	ctx := svc.NewServiceContext(c)
	server := rest.MustNewServer(c.RestConf)
	defer server.Stop()

    // 全局中间件
	server.Use(func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			logx.Info("global middleware")
			next(w, r)
		}
	})
	handler.RegisterHandlers(server, ctx)

	fmt.Printf("Starting server at %s:%d...\n", c.Host, c.Port)
	server.Start()
}
```
```text
{"@timestamp":"2021-02-09T11:50:15.388+08","level":"info","content":"global middleware"}
```

#### 在中间件里调用其它服务

通过闭包的方式把其它服务传递给中间件，示例如下：

```go
// 模拟的其它服务
type AnotherService struct{}

func (s *AnotherService) GetToken() string {
	return stringx.Rand()
}

// 常规中间件
func middleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("X-Middleware", "static-middleware")
		next(w, r)
	}
}

// 调用其它服务的中间件
func middlewareWithAnotherService(s *AnotherService) rest.Middleware {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			w.Header().Add("X-Middleware", s.GetToken())
			next(w, r)
		}
	}
}
```

完整代码参考：[https://github.com/zeromicro/zero-examples/tree/main/http/middleware](https://github.com/zeromicro/zero-examples/tree/main/http/middleware)

## rpc编写与调用
在一个大的系统中，多个子系统（服务）间必然存在数据传递，有数据传递就需要通信方式，你可以选择最简单的http进行通信，也可以选择rpc服务进行通信，
在go-zero，我们使用zrpc来进行服务间的通信，zrpc是基于grpc。

### 场景
在前面我们完善了对用户进行登录，用户查询图书等接口协议，但是用户在查询图书时没有做任何用户校验，如果当前用户是一个不存在的用户则我们不允许其查阅图书信息，
从上文信息我们可以得知，需要user服务提供一个方法来获取用户信息供search服务使用，因此我们就需要创建一个user rpc服务，并提供一个getUser方法。

### rpc服务编写

* 编译proto文件
```shell
$ vim service/user/cmd/rpc/user.proto
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
* 生成rpc服务代码
```shell
$ cd service/user/cmd/rpc
$ goctl rpc proto -src user.proto -dir .
```
:::tip
如果安装的 `protoc-gen-go` 版大于1.4.0, proto文件建议加上`go_package`
:::

* 添加配置及完善yaml配置项
```shell
$ vim service/user/cmd/rpc/internal/config/config.go
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
$ vim /service/user/cmd/rpc/etc/user.yaml
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
:::tip
$user: mysql数据库user

$password: mysql数据库密码

$url: mysql数据库连接地址

$db: mysql数据库db名称，即user表所在database

$host: redis连接地址 格式：ip:port，如:127.0.0.1:6379

$pass: redis密码
 
$etcdHost: etcd连接地址，格式：ip:port，如： 127.0.0.1:2379
:::

* 添加资源依赖
    ```shell
    $ vim service/user/cmd/rpc/internal/svc/servicecontext.go  
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
    $ service/user/cmd/rpc/internal/logic/getuserlogic.go
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

### 使用rpc
接下来我们在search服务中调用user rpc

* 添加UserRpc配置及yaml配置项
    ```shell
    $ vim service/search/cmd/api/internal/config/config.go
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
    $ vim service/search/cmd/api/etc/search-api.yaml
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
    :::tip
    $AccessSecret：这个值必须要和user api中声明的一致。
    
    $AccessExpire: 有效期
    
    $etcdHost： etcd连接地址
     
    etcd中的`Key`必须要和user rpc服务配置中Key一致
    :::
* 添加依赖
    ```shell
    $ vim service/search/cmd/api/internal/svc/servicecontext.go
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
* 补充逻辑
    ```shell
    $ vim /service/search/cmd/api/internal/logic/searchlogic.go
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
### 启动并验证服务
* 启动etcd、redis、mysql
* 启动user rpc
    ```shell
    $ cd /service/user/cmd/rpc
    $ go run user.go -f etc/user.yaml
    ```
    ```text
    Starting rpc server at 127.0.0.1:8080...
    ```
* 启动search api
```shell
$ cd service/search/cmd/api
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


## 错误处理
错误的处理是一个服务必不可缺的环节。在平时的业务开发中，我们可以认为http状态码不为`2xx`系列的，都可以认为是http请求错误，
并伴随响应的错误信息，但这些错误信息都是以plain text形式返回的。除此之外，我在业务中还会定义一些业务性错误，常用做法都是通过
`code`、`msg` 两个字段来进行业务处理结果描述，并且希望能够以json响应体来进行响应。

### 业务错误响应格式
* 业务处理正常
    ```json
    {
      "code": 0,
      "msg": "successful",
      "data": {
        ....
      }
    }
    ```

* 业务处理异常
    ```json
    {
      "code": 10001,
      "msg": "参数错误"
    }
    ```

### user api之login
在之前，我们在登录逻辑中处理用户名不存在时，直接返回来一个error。我们来登录并传递一个不存在的用户名看看效果。
```shell
curl -X POST \
  http://127.0.0.1:8888/user/login \
  -H 'content-type: application/json' \
  -d '{
	"username":"1",
	"password":"123456"
}'
```
```text
HTTP/1.1 400 Bad Request
Content-Type: text/plain; charset=utf-8
X-Content-Type-Options: nosniff
Date: Tue, 09 Feb 2021 06:38:42 GMT
Content-Length: 19

用户名不存在
```
接下来我们将其以json格式进行返回

### 自定义错误
* 首先在common中添加一个`baseerror.go`文件，并填入代码
    ```shell
    $ cd common
    $ mkdir errorx&&cd errorx
    $ vim baseerror.go
    ```
    ```goalng
    package errorx
    
    const defaultCode = 1001
    
    type CodeError struct {
        Code int    `json:"code"`
        Msg  string `json:"msg"`
    }
    
    type CodeErrorResponse struct {
        Code int    `json:"code"`
        Msg  string `json:"msg"`
    }
    
    func NewCodeError(code int, msg string) error {
        return &CodeError{Code: code, Msg: msg}
    }
    
    func NewDefaultError(msg string) error {
        return NewCodeError(defaultCode, msg)
    }
    
    func (e *CodeError) Error() string {
        return e.Msg
    }
    
    func (e *CodeError) Data() *CodeErrorResponse {
        return &CodeErrorResponse{
            Code: e.Code,
            Msg:  e.Msg,
        }
    }
    
    ```

* 将登录逻辑中错误用CodeError自定义错误替换
    ```go
    if len(strings.TrimSpace(req.Username)) == 0 || len(strings.TrimSpace(req.Password)) == 0 {
            return nil, errorx.NewDefaultError("参数错误")
        }
    
        userInfo, err := l.svcCtx.UserModel.FindOneByNumber(req.Username)
        switch err {
        case nil:
        case model.ErrNotFound:
            return nil, errorx.NewDefaultError("用户名不存在")
        default:
            return nil, err
        }
    
        if userInfo.Password != req.Password {
            return nil, errorx.NewDefaultError("用户密码不正确")
        }
    
        now := time.Now().Unix()
        accessExpire := l.svcCtx.Config.Auth.AccessExpire
        jwtToken, err := l.getJwtToken(l.svcCtx.Config.Auth.AccessSecret, now, l.svcCtx.Config.Auth.AccessExpire, userInfo.Id)
        if err != nil {
            return nil, err
        }
    
        return &types.LoginReply{
            Id:           userInfo.Id,
            Name:         userInfo.Name,
            Gender:       userInfo.Gender,
            AccessToken:  jwtToken,
            AccessExpire: now + accessExpire,
            RefreshAfter: now + accessExpire/2,
        }, nil
    ```

* 开启自定义错误
    ```shell
    $ vim service/user/cmd/api/user.go
    ```
    ```go
    func main() {
        flag.Parse()
    
        var c config.Config
        conf.MustLoad(*configFile, &c)
    
        ctx := svc.NewServiceContext(c)
        server := rest.MustNewServer(c.RestConf)
        defer server.Stop()
    
        handler.RegisterHandlers(server, ctx)
    
        // 自定义错误
        httpx.SetErrorHandler(func(err error) (int, interface{}) {
            switch e := err.(type) {
            case *errorx.CodeError:
                return http.StatusOK, e.Data()
            default:
                return http.StatusInternalServerError, nil
            }
        })
    
        fmt.Printf("Starting server at %s:%d...\n", c.Host, c.Port)
        server.Start()
    }
    ```
* 重启服务验证
    ```shell
    $ curl -i -X POST \
      http://127.0.0.1:8888/user/login \
      -H 'content-type: application/json' \
      -d '{
            "username":"1",
            "password":"123456"
    }'
    ```
    ```text
    HTTP/1.1 200 OK
    Content-Type: application/json
    Date: Tue, 09 Feb 2021 06:47:29 GMT
    Content-Length: 40
    
    {"code":1001,"msg":"用户名不存在"}
    ```

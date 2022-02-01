---
sidebar_position: 4
---

# Business Development

In this section we use a simple example to demonstrate some basic functionality in go-zero.

## demo project download
Before we get into the rest of the documentation, take a look at the source code, which we will use to demonstrate the functionality incrementally.
Instead of starting from zero, if you start from [quick-start] (... /quick-start/concept.md) chapter, this source structure will not be a problem for you.

Click <a href="https://zeromicro.github.io/go-zero-pages/resource/book.zip">here to download the </a> demo project base source code

## Demo project description

### Scenario
Xiaoming, a programmer, needs to borrow a copy of Journey to the West. In the absence of an online library management system, he has to go to the front desk of the library every day to consult the librarian
* Xiao Ming: Hello, is the book "Journey to the West" still available today?
* Administrator: No, come back tomorrow to check it out.

After a day, Xiaoming came to the library again and asked.
* Xiaoming: Hello, is the book "Journey to the West" still available today?
* The administrator: No, you can come back in two days.

So after many iterations, Xiao Ming was also futile, wasting a lot of time on the way back and forth, so finally could not stand the backward library management system.
He decided to make a book access system by himself.

### Expected to achieve the goal
* User login
  Rely on existing student system data for login
* Book search
  Search for books based on book keywords and check the number of books remaining.

### System analysis

#### Service splitting
* user
    * api provides user login protocol
    * rpc for search service to access user data
* search
    * api provides the book search protocol

:::tip
Although this tiny book checkout system is small and not quite in line with the business scenario from a practical point of view, the above two functions alone have satisfied our demonstration of the go-zero api/rpc scenario.
Later, in order to meet the richer go-zero function demonstration, will be inserted in the document business that is related to the description of the function. Only one scenario is introduced here.
 
Note: please create your own sql statements in user to the db, for more preparation see **[preparation](prepare.md)**
 
Add some preset user data to the database for later use. For the sake of space, the demo project does not do a detailed demonstration of such operations as inserting data.
:::

#### Reference preset data
```sql
INSERT INTO `user` (number,name,password,gender)values ('666','小明','123456','男');
```

## Directory splitting
Directory splitting refers to directory splitting in conjunction with go-zero's best practices, which is related to microservice splitting, and in the team's internal best practices
We split a system into multiple subsystems according to the business horizontal split, each subsystem should have independent persistent storage, caching system.
For example, a mall system needs to have a user system (user), product management system (product), order system (order), shopping cart system (cart), clearing house system (pay), afterSale system (afterSale), etc.

### System structure analysis
In the mall system mentioned above, each system provides services to the outside world (http) while also providing data to other subsystems for data access interface (rpc), so each subsystem can be split into a service, and the outside world provides two ways to access the system api and rpc, so that
The above system has the following structure according to the directory structure to split:

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

### rpc call chain suggestions
When designing the system, try to make the call chain between services is one-way, rather than circular call, for example: order service calls user service, and user service in turn will call order's service.
When one of the services start to fail, it will affect each other and enter a dead loop, you order that the failure of the user service, and user that the order service caused, if there are a large number of services exist in the chain of mutual invocation.
Then you need to consider whether service splitting is reasonable.

### Directory structure of common service types
In the above services, only api/rpc services are listed, in addition, there may be more service types under one service, such as rmq (message processing system), cron (timed task system), script (script), etc.
So a service may contain the following directory structure.

```text
user
    ├── api //  http access service, business requirements implementation
    ├── cronjob // Timed tasks, timed data update operations
    ├── rmq // Message processing system: mq and dq, dealing with some high concurrency and delayed message business
    ├── rpc // rpc service, providing basic data access to other subsystems
    └── script // Scripts to handle some ad hoc operational requirements, ad hoc data fixes
```

### Example of the complete project directory structure
```text
mall // Project Name
├── common // Universal Library
│   ├── randx
│   └── stringx
├── go.mod
├── go.sum
└── service // Service Storage Directory
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

## model generation
First, after downloading the [demo project](https://go-zero.dev/cn/resource/book.zip), we use the user's model for code generation demo.

The model is the bridge for the service to access the persistent data layer, the persistent data of the business often exists in mysql, mongo and other databases, and we all know that there is nothing better than CURD for a database operation.
I once wrote 40 model files when writing a business, and depending on the complexity of the different business requirements, each model file takes on average almost
10 minutes, for 40 files, 400 minutes of work time, almost a day's workload, and goctl tools can be completed in 10 seconds to complete the 400 minutes of work.

### Preparation
Go into the demo project book, find the user.sql file under user/model, and execute it in your own database to build the table.

### Code generation (with cache)
#### way one (ddl)
Go to the `service/user/model` directory and execute the command
```shell
$ cd service/user/model
$ goctl model mysql ddl -src user.sql -dir . -c
```
```text
Done.
```



#### way two(datasource)
```shell
$ goctl model mysql datasource -url="$datasource" -table="user" -c -dir .
```
```text
Done.
```
:::tip
$datasource is the database connection address
:::

#### way three(intellij plugin)
In Goland, right click on `user.sql`, go to `New`->`Go Zero`->`Model Code` to generate it, or open the `user.sql` file.
Go to the edit area, use the shortcut `Command+N` (for mac OS) or `alt+insert` (for windows) and select `Model Code`.

![model生成](https://zeromicro.github.io/go-zero-pages/resource/intellij-model.png)

:::tip
intellij plugin generation requires the installation of the goctl plugin
:::

### Validate the generated model file
tree
```shell
$ tree，Click to enter in order New->Go Zero->Api Code
```
```text
.
├── user.sql
├── usermodel.go
└── vars.go
```

## api file writing

### Write user.api file
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

### Generate api service
#### way one

```shell
$ cd book/service/user/cmd/api
$ goctl api go -api user.api -dir . 
```
```text
Done.
```

#### way two

Right click on the `user.api` file, click `New`->`Go Zero`->`Api Code`, enter the target directory, that is, the target directory of the api source code, the default is the directory where user.api is located, select the directory and click OK.
![api generation](https://zeromicro.github.io/go-zero-pages/resource/goctl-api.png)
![api generation directory selection](https://zeromicro.github.io/go-zero-pages/resource/goctl-api-select.png)

#### way three

Open user.api, enter the editing area, use the shortcut `Command+N` (for mac OS) or `alt+insert` (for windows), select `Api Code`, also enter the directory selection popup, select the directory and click OK.

## Business coding

In the previous section, we have written user.api based on the initial requirements to describe what services the user service provides access to externally, in this section we continue where we left off.
In this section, we'll follow up on the previous steps and talk about how go-zero can be used in a real business through business coding.

### Adding Mysql configuration
```shell
$ vim service/user/cmd/api/internal/config/config.go
```
```go
package config

import "github.com/zeromicro/go-zero/rest"

type Config struct {
    rest.RestConf
    Mysql struct{
        DataSource string
    }
    
    CacheRedis cache.CacheConf
}
```

### Improve yaml configuration
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
$user: mysql database user
 
$password: mysql database password
  
$url: mysql database connection address
 
$db: mysql database db name, i.e. the database where the user table is located
 
$host: redis connection address Format: ip:port, e.g.:127.0.0.1:6379
 
$pass: redis password
:::

### Perfect service dependence
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
### Populate login logic
```shell
$ vim service/user/cmd/api/internal/logic/loginlogic.go
```

```go
func (l *LoginLogic) Login(req types.LoginReq) (*types.LoginReply, error) {
    if len(strings.TrimSpace(req.Username)) == 0 || len(strings.TrimSpace(req.Password)) == 0 {
        return nil, errors.New("Parameter error")
    }
    
    userInfo, err := l.svcCtx.UserModel.FindOneByNumber(req.Username)
    switch err {
    case nil:
    case model.ErrNotFound:
        return nil, errors.New("Username does not exist")
    default:
        return nil, err
    }
    
    if userInfo.Password != req.Password {
        return nil, errors.New("Incorrect user password")
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

## jwt forensics

### Overview
> JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and independent method for securely transferring information as JSON objects between parties. Since this information is digitally signed, it can be verified and trusted. A JWT can be signed using a secret (using the HMAC algorithm) or a public/private key pair using RSA or ECDSA.

### When should JWT be used
* Authorization: This is the most common scenario for using JWT. Once a user logs in, each subsequent request will include the JWT, thus allowing the user to access the routes, services and resources allowed by the token. Single sign-on is a feature that is widely used in JWT today because it has minimal overhead and can be easily used across domains.

* Information Exchange: JSON Web tokens are a great way to securely transfer information between parties. Because the JWT can be signed (e.g., using a public/private key pair), you can be sure that the sender is who they say they are. In addition, because signatures are calculated using headers and payloads, you can also verify that the content has not been tampered with.

### Why use JSON Web tokens
Because JSON is less verbose than XML, JSON is also smaller in size when encoded, making JWTs more compact than SAML. This makes JWT a good choice for passing in HTML and HTTP environments.

In terms of security, SWTs can only be symmetrically signed by shared secrets using the HMAC algorithm. However, JWT and SAML tokens can be signed using a public/private key pair in the form of an X.509 certificate. Signing XML using XML Digital Signature without introducing ambiguous security vulnerabilities is very difficult compared to the simplicity of signing JSON.

JSON parsers are common in most programming languages because they map directly to objects. In contrast, XML does not have a natural document-to-object mapping. This makes using JWT much easier than SAML assertions.

Regarding usage, JWT is used at Internet scale. This highlights the simplicity of client-side processing of JSON Web tokens on multiple platforms (especially mobile platforms).

:::tip
The above is all from [jwt official website introduction](https://jwt.io/introduction)
:::


### How to use jwt in go-zero
jwt authentication is generally used in the api layer, and in this demo project we generate jwt token when user api logs in and verify user jwt token when search api queries for books in two steps respectively.

#### user api generates jwt token
Moving on from the [business coding](business.md) section, we refine the `getJwtToken` method left over from the previous section, i.e. the jwt token generation logic

##### Add configuration definition and yaml configuration items
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
$AccessSecret: the key to generate the jwt token, the simplest way can use a uuid value.
 
$AccessExpire: the validity of the jwt token, unit: second
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

#### search api using jwt token authentication
##### writing search.api file
```shell
$ vim service/search/cmd/api/search.api
```
```text
type (
    SearchReq {
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
`jwt: Auth`：Enabling jwt forensics
 
If the route requires jwt authentication, this syntax flag needs to be declared above the service, as in ` /search/do` above
 
Routes that do not require jwt authentication do not need to be declared, such as ` /search/ping` above
:::

##### Generating Code
There are three ways to generate code as described earlier, so I won't go over them here.


##### Add yaml configuration items
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
$AccessSecret：This value must be the same as the one declared in the user api.
 
$AccessExpire: Expiration date
 
Change the port here to avoid conflict with user api port `8888`
:::

#### verify jwt token
* Start user api service and login
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
* Start the search api service and call `/search/do` to verify that the jwt authentication passes
    ```shell
    $ go run search.go -f etc/search-api.yaml
    ```
    ```text
    Starting server at 0.0.0.0:8889...
    ```
    Let's not pass the jwt token and see the result
    ```shell
    $ curl -i -X GET \
      'http://127.0.0.1:8889/search/do?name=%E8%A5%BF%E6%B8%B8%E8%AE%B0'
    ```
    ```text
    HTTP/1.1 401 Unauthorized
    Date: Mon, 08 Feb 2021 10:41:57 GMT
    Content-Length: 0
    ```
  
  Obviously, jwt authentication failed and returned 401 statusCode, next we bring the jwt token (i.e. the `accessToken` returned by the user login)
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
  
At this point, the jwt demo is complete from generation to use. The authentication of the jwt token is already encapsulated inside go-zero, you just need to simply declare it when defining the service in the api file.

#### gets the information carried in the jwt token
go-zero will parse the jwt token and put the kv passed in when the user generates the token in the Context of http.
```shell
$ vim /service/search/cmd/api/internal/logic/searchlogic.go
```
Add a log to output the userId parsed from jwt.
```go
func (l *SearchLogic) Search(req types.SearchReq) (*types.SearchReply, error) {
	logx.Infof("userId: %v",l.ctx.Value("userId"))
	return &types.SearchReply{}, nil
}
```
Running results
```text
{"@timestamp":"2021-02-09T10:29:09.399+08","level":"info","content":"userId: 1"}
```

## Middleware Usage
In the previous section, we demonstrated how to use jwt forensics, I believe you have mastered the basic use of jwt, this section we look at how to use the api service middleware.

### Middleware classification
In go-zero, middleware can be divided into routing middleware and global middleware, routing middleware refers to some specific routes need to implement middleware logic, its similar to jwt, no route placed under `jwt:xxx` will not use the middleware functionality.
while the scope of the global middleware is the entire service.

### Middleware usage
Here is an example of the `search` service to demonstrate the use of middleware

#### routing middleware
* Rewrite the `search.api` file and add the `middleware` declaration
    ```shell
    $ cd service/search/cmd/api
    $ vim search.api
    ```
    ```text
    type SearchReq struct {}
    
    type SearchReply struct {}
    
    @server(
        jwt: Auth
        middleware: Example 
    )
    service search-api {
        @handler search
        get /search/do (SearchReq) returns (SearchReply)
    }
    ```
* Regenerate api code
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
    After generation, there will be one more `middleware` directory in the `internal` directory, where the middleware files are located and the subsequent middleware implementation logic is written here.
* Improve the resource dependency `ServiceContext`.
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
* Writing middleware logic
  Here only add one line of log, content example middle, if the service is running output example middle means that the middleware is used up.
  
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
* Start Service Verification
    ```text
    {"@timestamp":"2021-02-09T11:32:57.931+08","level":"info","content":"example middle"}
    ```

#### Global Middleware
Just use the Use method provided by rest.Server
```go
func main() {
	flag.Parse()

	var c config.Config
	conf.MustLoad(*configFile, &c)

	ctx := svc.NewServiceContext(c)
	server := rest.MustNewServer(c.RestConf)
	defer server.Stop()

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

#### Calling other services from within the middleware

Other services are passed to the middleware by means of closures, as in the following example.

```go
type AnotherService struct{}

func (s *AnotherService) GetToken() string {
	return stringx.Rand()
}

func middleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("X-Middleware", "static-middleware")
		next(w, r)
	}
}

func middlewareWithAnotherService(s *AnotherService) rest.Middleware {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			w.Header().Add("X-Middleware", s.GetToken())
			next(w, r)
		}
	}
}
```

Full code reference：[https://github.com/zeromicro/zero-examples/tree/main/http/middleware](https://github.com/zeromicro/zero-examples/tree/main/http/middleware)

## rpc writing and calling
In a large system, there is bound to be data transfer between multiple subsystems (services), and with data transfer there is a need for communication methods, you can choose the simplest http for communication, or you can choose rpc services for communication.
At go-zero, we use zrpc to communicate between services. zrpc is based on grpc.

### Scenarios
We have perfected the interface protocols for user login and user query, but the user does not do any user verification when querying books, so if the current user is a non-existent user we do not allow him/her to access the book information.
From the information above, we know that we need the user service to provide a method to get user information for the search service, so we need to create a user rpc service and provide a getUser method.

### rpc service writing

* Compile the proto file
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
  
* Generate rpc service code
```shell
$ cd service/user/cmd/rpc
$ goctl rpc proto -src user.proto -dir .
```
:::tip
If the installed version of `protoc-gen-go` is larger than 1.4.0, it is recommended to add `go_package` to the proto file
:::

* Add configuration and refine yaml configuration items
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
$user: mysql database user
    
$password: mysql database password

$url: mysql database connection address

$db: mysql database db name, i.e. the database where the user table is located

$host: redis connection address Format: ip:port, e.g.:127.0.0.1:6379

$pass: redis password
 
$etcdHost: etcd connection address, format: ip:port, e.g.: 127.0.0.1:2379
:::

* Adding Resource Dependencies
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
* Adding rpc logic
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

### Using rpc
Next we call user rpc in the search service

* Add UserRpc configuration and yaml configuration items
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
$AccessSecret: This value must be the same as the one declared in the user api.
    
$AccessExpire: expiration date

$etcdHost: etcd connection address
 
The `Key` in etcd must be the same as the Key in the user rpc service configuration
:::
* Adding dependencies
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
* Additional logic
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
  
### Start and verify services
* Start etcd, redis, mysql
* Start user rpc
    ```shell
    $ cd /service/user/cmd/rpc
    $ go run user.go -f etc/user.yaml
    ```
    ```text
    Starting rpc server at 127.0.0.1:8080...
    ```
* start search api
```shell
$ cd service/search/cmd/api
$ go run search.go -f etc/search-api.yaml
```

* Validation Services
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


## Error Handling
Error handling is an indispensable part of a service. In normal business development, we can consider any http status code not in the `2xx` series to be an http request error, along with a response error message.
and accompanied by the response error message, but these error messages are returned in the form of plain text. In addition, I also define some business errors in the business, and the common practice is to use the
`code`, `msg` fields to describe the results of business processing, and would like to be able to respond in a json response body.

### Business error response format
* Business processing is normal
    ```json
    {
      "code": 0,
      "msg": "successful",
      "data": {
        ....
      }
    }
    ```

* Business Processing Exceptions
```json
{
  "code": 10001,
  "msg": "Parameter error"
}
```

### user api login
Previously, when we handled a non-existent username in the login logic, an error was returned directly, so let's login and pass a non-existent username to see the effect.
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

Username does not exist
```

Next, we return it in json format

### Custom errors
* First add a `baseerror.go` file to the common and fill in the code
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

* Replace errors in the login logic with CodeError custom errors
    ```go
    if len(strings.TrimSpace(req.Username)) == 0 || len(strings.TrimSpace(req.Password)) == 0 {
            return nil, errorx.NewDefaultError("xxx")
        }
    
        userInfo, err := l.svcCtx.UserModel.FindOneByNumber(req.Username)
        switch err {
        case nil:
        case model.ErrNotFound:
            return nil, errorx.NewDefaultError("xxx")
        default:
            return nil, err
        }
    
        if userInfo.Password != req.Password {
            return nil, errorx.NewDefaultError("xxx")
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

* Turn on custom errors
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
* Restart service verification
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
    
    {"code":1001,"msg":"Username does not exist"}
    ```

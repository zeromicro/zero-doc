# 获取用户信息(jwt鉴权)

# 概要


本节将通过获取用户信息来演示jwt鉴权怎么使用


# 定义获取用户信息路由


编辑user.api文件，增加获取用户信息路由


```
@handler userInfo
get /user/info () returns (UserReply)
```


# 开启jwt鉴权


由于之前的`/user/ping`、`/user/register`、`user/login`是不需要鉴权就可以直接访问，因此将需要鉴权的协议`/user/info`单独放在一个service组中，并且对该service增加`jwt`标志，内容如下


```
@server(
	jwt: Auth
)
service user-api{
	@handler userInfo
	get /user/info () returns (UserReply)
}
```


完整的user.api内容如下


```go
info(
	title: "user api"
	desc: "用户系统"
	author: "anqiansong"
	email: "anqiansong@xiaoheiban.cn"
)

type RegisterReq {
	Username string `json:"username"`
	Mobile string `json:"mobile"`
	Password string `json:"password"`
}

type LoginReq {
	Username string `json:"username"`
	Password string `json:"password"`
}

type UserReply {
	Id int64 `json:"id"`
	Username string `json:"username"`
	Mobile string `json:"mobile"`
	Nickname string `json:"nickname"`
	Gender string `json:"gender"`
	JwtToken
}

type JwtToken {
	AccessToken string `json:"accessToken,omitempty"`
	AccessExpire int64 `json:"accessExpire,omitempty"`
	RefreshAfter int64 `json:"refreshAfter,omitempty"`
}

service user-api {
	@handler ping
	post /user/ping ()
	
	@handler register
	post /user/register (RegisterReq)
	
	@handler login
	post /user/login (LoginReq) returns (UserReply)
}

@server(
	jwt: Auth
	middleware: Usercheck
)
service user-api {
	@handler userInfo
	get /user/info () returns (UserReply)
}
```


# 重新生成代码


进入api(`book/user/api`)文件夹后执行


```bash
$ goctl api go -api user.api -dir .
```


> NOTE: 多次重复生成代码会有些警告，直接回车即可
> ![warning.png](https://cdn.nlark.com/yuque/0/2020/png/465993/1603555564119-477939d2-ebfc-48f8-bdd1-527ceec26c4f.png#align=left&display=inline&height=832&margin=%5Bobject%20Object%5D&name=warning.png&originHeight=832&originWidth=2224&size=253322&status=done&style=none&width=2224)



最新代码结构如下


```bash
.
├── go.mod
├── go.sum
├── shared
│   └── baseerror.go
└── user
    ├── api
    │   ├── etc
    │   │   └── user-api.yaml
    │   ├── internal
    │   │   ├── config
    │   │   │   └── config.go
    │   │   ├── handler
    │   │   │   ├── loginhandler.go
    │   │   │   ├── pinghandler.go
    │   │   │   ├── registerhandler.go
    │   │   │   ├── routes.go
    │   │   │   └── userinfohandler.go
    │   │   ├── logic
    │   │   │   ├── error.go
    │   │   │   ├── loginlogic.go
    │   │   │   ├── pinglogic.go
    │   │   │   ├── registerlogic.go
    │   │   │   └── userinfologic.go
    │   │   ├── svc
    │   │   │   └── servicecontext.go
    │   │   └── types
    │   │       └── types.go
    │   ├── user.api
    │   └── user.go
    ├── model
    │   ├── usermodel.go
    │   └── vars.go
```


我们来查看一下routes中已经对`/user/info`路由已经进行了单独的分组，且带上了jwt鉴权option
![route-user-info-jwt.png](https://cdn.nlark.com/yuque/0/2020/png/465993/1603555590445-9c9b998b-089a-4524-8b89-dfeef9475af5.png#align=left&display=inline&height=1732&margin=%5Bobject%20Object%5D&name=route-user-info-jwt.png&originHeight=1732&originWidth=2224&size=281752&status=done&style=none&width=2224)


# 验证jwt


我们先不加`Authorization`查看一下结果


```bash
$ curl -i -X GET \
  http://127.0.0.1:8888/user/info \
  -H 'cache-control: no-cache'
```


![auth-disable.png](https://cdn.nlark.com/yuque/0/2020/png/465993/1603555608605-fb9c7bd2-eefe-4599-8859-ac6e175861fa.png#align=left&display=inline&height=364&margin=%5Bobject%20Object%5D&name=auth-disable.png&originHeight=364&originWidth=2224&size=63173&status=done&style=none&width=2224)


从途中可以看到，状态行中有`HTTP/1.1 401 Unauthorized`内容，很明显，未通过鉴权


接下来我们添加`Authorization`再请求一下


```
curl -i -X GET \
  http://127.0.0.1:8888/user/info \
  -H 'authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDM2MzU0OTMsImlhdCI6MTYwMzU0OTA5M30.fGNe-sAEL6NuWDPWpfVi840qsamPA3fC9h4iO3rF9v0'
```


NOTE: 这里的`authorization`需要替换为你当前获取到且未过期的accessToken,根据前一节登录时返回的`accessToken`


![auth.png](https://cdn.nlark.com/yuque/0/2020/png/465993/1603555619289-17719ef7-f94b-4ae8-b4f8-30de85a2d72b.png#align=left&display=inline&height=508&margin=%5Bobject%20Object%5D&name=auth.png&originHeight=508&originWidth=2224&size=124071&status=done&style=none&width=2224)


<Vssue title="获取用户信息JWT" />

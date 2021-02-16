# 创建user-api服务

# 需求描述


实现用户注册、登录、获取用户信息功能


# 一、创建工程


创建一个名称为 `book` 的 `go mod` 工程


```bash
$ mkdir book && cd book
$ go mod init book
```


查看book目录


```bash
$ tree
.
└── go.mod

0 directories, 1 file
```


# 二、创建api文件


创建user/api文件夹


```bash
$ mkdir -p user/api && cd user/api
```


创建user.api文件


```go
$ goctl api -o user.api
```


输出结果


```yaml
Done.
```


> NOTE:关于api语法请查看[《api语法》](https://www.yuque.com/tal-tech/go-zero/ze9i30)



# 三、定义api服务


我们用goland打开book工程，修改user.api文件内容为


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
```


# 四、生成user api服务


```bash
$ goctl api go -api user.api -dir .
```


查看一下 `api` 目录


```shell
$ tree
.
├── etc
│   └── user-api.yaml
├── internal
│   ├── config
│   │   └── config.go
│   ├── handler
│   │   ├── loginhandler.go
│   │   ├── pinghandler.go
│   │   ├── registerhandler.go
│   │   └── routes.go
│   ├── logic
│   │   ├── loginlogic.go
│   │   ├── pinglogic.go
│   │   └── registerlogic.go
│   ├── svc
│   │   └── servicecontext.go
│   └── types
│       └── types.go
├── user.api
└── user.go
```


# 五、启动服务


启动一个服务，侦听8888端口


```bash
$ go run user.go -f etc/user-api.yaml
```


![api-run-status.png](https://cdn.nlark.com/yuque/0/2020/png/465993/1603441459265-57cef5d4-f14b-4701-9590-d88beacae48d.png#align=left&display=inline&height=472&margin=%5Bobject%20Object%5D&name=api-run-status.png&originHeight=472&originWidth=2224&size=173119&status=done&style=none&width=2224)


访问服务


```bash
$ curl -i -X POST http://localhost:8888/user/ping
```


![curl-01.png](https://cdn.nlark.com/yuque/0/2020/png/465993/1603441470574-b27a0636-a677-4738-b30d-bf1425cae60b.png#align=left&display=inline&height=292&margin=%5Bobject%20Object%5D&name=curl-01.png&originHeight=292&originWidth=2224&size=52494&status=done&style=none&width=2224)


# 总结


本节主要演示怎样从创建api文件到启动一个api服务，下一节我们将演示怎么连接访问数据库进行数据交互


# 参考文档


- [附录1:api语法定义](https://www.yuque.com/tal-tech/go-zero/ze9i30)
- [附录2:api目录结构](https://www.yuque.com/tal-tech/go-zero/wixzpx)

<Vssue title="创建API服务" />

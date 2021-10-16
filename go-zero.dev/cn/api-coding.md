# api文件编写

## 编写user.api文件
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
## 生成api服务
### 方式一

```shell
$ cd book/service/user/cmd/api
$ goctl api go -api user.api -dir . 
```
```text
Done.
```

### 方式二

在 `user.api` 文件右键，依次点击进入 `New`->`Go Zero`->`Api Code` ，进入目标目录选择，即api源码的目标存放目录，默认为user.api所在目录，选择好目录后点击OK即可。
![api生成](https://zeromicro.github.io/go-zero-pages/resource/goctl-api.png)
![api生成目录选择](https://zeromicro.github.io/go-zero-pages/resource/goctl-api-select.png)

### 方式三

打开user.api，进入编辑区,使用快捷键`Command+N`（for mac OS）或者 `alt+insert`（for windows），选择`Api Code`，同样进入目录选择弹窗，选择好目录后点击OK即可。

# 猜你想看
* [api语法](api-grammar.md)
* [goctl api命令](goctl-api.md)
* [api目录结构介绍](api-dir.md)
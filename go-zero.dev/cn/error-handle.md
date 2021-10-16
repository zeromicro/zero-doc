# 错误处理
错误的处理是一个服务必不可缺的环节。在平时的业务开发中，我们可以认为http状态码不为`2xx`系列的，都可以认为是http请求错误，
并伴随响应的错误信息，但这些错误信息都是以plain text形式返回的。除此之外，我在业务中还会定义一些业务性错误，常用做法都是通过
`code`、`msg` 两个字段来进行业务处理结果描述，并且希望能够以json响应体来进行响应。

## 业务错误响应格式
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

## user api之login
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

## 自定义错误
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

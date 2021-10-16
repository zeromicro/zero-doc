# Error Handling
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

Error handling is an indispensable part of service. In normal business development, we can think that the http status code is not in the `2xx` series, it can be regarded as an http request error.
It is accompanied by error messages in response, but these error messages are all returned in plain text. In addition, I will define some business errors in the business, and the common practice is to pass
The two fields `code` and `msg` are used to describe the business processing results, and it is hoped that the response can be made with the json response body.

## Business error response format
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

* Business processing exception
    ```json
    {
      "code": 10001,
      "msg": "something wrong"
    }
    ```

## login of user api
Previously, when we handled the login logic when the username did not exist, an error was directly returned. Let's log in and pass a username that does not exist to see the effect.

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
Next we will return it in json format

## Custom error
* First add a `baseerror.go` file in common and fill in the code
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

* Replace errors in login logic with CodeError custom errors
    ```go
    if len(strings.TrimSpace(req.Username)) == 0 || len(strings.TrimSpace(req.Password)) == 0 {
            return nil, errorx.NewDefaultError("Invalid parameter")
        }
    
        userInfo, err := l.svcCtx.UserModel.FindOneByNumber(req.Username)
        switch err {
        case nil:
        case model.ErrNotFound:
            return nil, errorx.NewDefaultError("Username does not exist")
        default:
            return nil, err
        }
    
        if userInfo.Password != req.Password {
            return nil, errorx.NewDefaultError("User password is incorrect")
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

* Use custom errors
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
    
        // Custom error
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

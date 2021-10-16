# Business code

> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

In the previous section, we have written user.api based on the preliminary requirements to describe which services the user service provides to the outside world. In this section, we will continue with the previous steps.
Use business coding to tell how go-zero is used in actual business.

## Add Mysql configuration
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

## Improve yaml configuration
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

> [!TIP]
> $user: mysql database user
> 
> $password: mysql database password
> 
> $url: mysql database connection address
> 
> $db: mysql database db name, that is, the database where the user table is located
> 
> $host: Redis connection address Format: ip:port, such as: 127.0.0.1:6379
> 
> $pass: redis password
> 
> For more configuration information, please refer to [api configuration introduction](api-config.md)

## Improve service dependence
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
## Fill in the login logic
```shell
$ vim service/user/cmd/api/internal/logic/loginlogic.go
```

```go
func (l *LoginLogic) Login(req types.LoginReq) (*types.LoginReply, error) {
    if len(strings.TrimSpace(req.Username)) == 0 || len(strings.TrimSpace(req.Password)) == 0 {
        return nil, errors.New("Invalid parameter")
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
        return nil, errors.New("User password is incorrect")
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
> [!TIP]
> For the code implementation of [start]-[end] in the above code, please refer to the [Jwt Authentication](jwt.md) chapter

# Guess you wants
* [API IDL](api-grammar.md)
* [API Commands](goctl-api.md)
* [API Directory Structure](api-dir.md)
* [JWT](jwt.md)
* [API Configuration](api-config.md)
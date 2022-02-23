# 业务编码
前面一节，我们已经根据初步需求编写了user.api来描述user服务对外提供哪些服务访问，在本节我们接着前面的步伐，
通过业务编码来讲述go-zero怎么在实际业务中使用。

## 添加Mysql配置
```shell
$ vim service/user/api/internal/config/config.go
```
```go
package config

import (
    "github.com/zeromicro/go-zero/rest"
    "github.com/tal-tech/go-zero/core/stores/cache"
    )


type Config struct {
    rest.RestConf
    Mysql struct{
        DataSource string
    }
    
    CacheRedis cache.CacheConf
}
```

## 完善yaml配置
```shell
$ vim service/user/api/etc/user-api.yaml
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
> $user: mysql数据库user
> 
> $password: mysql数据库密码
> 
> $url: mysql数据库连接地址
> 
> $db: mysql数据库db名称，即user表所在database
> 
> $host: redis连接地址 格式：ip:port，如:127.0.0.1:6379
> 
> $pass: redis密码
> 
> 更多配置信息，请参考[api配置介绍](api-config.md)

## 完善服务依赖
```shell
$ vim service/user/api/internal/svc/servicecontext.go
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
## 填充登录逻辑
```shell
$ vim service/user/api/internal/logic/loginlogic.go
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
> [!TIP]
> 上述代码中 [start]-[end]的代码实现见[jwt鉴权](jwt.md)章节

# 猜你想看
* [api语法](api-grammar.md)
* [goctl api命令](goctl-api.md)
* [api目录结构介绍](api-dir.md)
* [jwt鉴权](jwt.md)
* [api配置介绍](api-config.md)

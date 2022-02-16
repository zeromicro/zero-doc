# jwt生成

# 概要


生成jwt token


# 增加配置项


编辑config.go


```bash
$ vi book/user/api/internal/config/config.go
```


新增jwt配置项后得到如下内容


```bash
package config

import (
	"github.com/zeromicro/go-zero/rest"
)

type Config struct {
	rest.RestConf
	Mysql struct {
		DataSource string
	}
	Auth struct {
		AccessSecret string
		AccessExpire int64
	}
}
```


编辑 user-api.yaml文件，增加Jwt配置后得到内容


```yaml
Name: user-api
Host: 0.0.0.0
Port: 8888
Mysql:
  DataSource: user:password@tcp(127.0.0.1:3306)/gozero?charset=utf8mb4&parseTime=true&loc=Asia%2FShanghai
Auth:
  AccessSecret: ad879037-c7a4-4063-9236-6bfc35d54b7d
  AccessExpire: 86400
```


NOTE: `user`和`password`需要替换为实际的值
# 修改loginlogic.go


增加方法getJwtToken


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


修改Login方法返回jwt token给客户端，最终代码为


```bash
package logic

import (
	"book/user/api/internal/svc"
	"book/user/api/internal/types"
	"book/user/model"
	"context"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/zeromicro/go-zero/core/logx"
)

type LoginLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewLoginLogic(ctx context.Context, svcCtx *svc.ServiceContext) LoginLogic {
	return LoginLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *LoginLogic) Login(req types.LoginReq) (*types.UserReply, error) {
	// 忽略逻辑校验
	userInfo, err := l.svcCtx.UserModel.FindOneByName(req.Username)
	switch err {
	case nil:
		if userInfo.Password != req.Password {
			return nil, errorIncorrectPassword
		}
		now := time.Now().Unix()
		accessExpire := l.svcCtx.Config.Auth.AccessExpire
		jwtToken, err := l.getJwtToken(l.svcCtx.Config.Auth.AccessSecret, now, accessExpire, userInfo.Id)
		if err != nil {
			return nil, err
		}

		return &types.UserReply{
			Id:       userInfo.Id,
			Username: userInfo.Name,
			Mobile:   userInfo.Mobile,
			Nickname: userInfo.Nickname,
			Gender:   userInfo.Gender,
			JwtToken: types.JwtToken{
				AccessToken:  jwtToken,
				AccessExpire: now + accessExpire,
				RefreshAfter: now + accessExpire/2,
			},
		}, nil
	case model.ErrNotFound:
		return nil, errorUsernameUnRegister
	default:
		return nil, err
	}
}

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


# 登录校验


启动user api服务，我们登录看看是否能够达到我们预期值


```bash
curl -i -X POST \
  http://127.0.0.1:8888/user/login \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
        "username":"admin",
        "password":"666666"
}'
```
> 注意：windows系统curl json需要对json进行转义。

![curl-login-jwt.png](https://cdn.nlark.com/yuque/0/2020/png/465993/1603555488123-96e688eb-c8e4-4fd1-8a3f-8bc8e63e81a3.png#align=left&display=inline&height=724&margin=%5Bobject%20Object%5D&name=curl-login-jwt.png&originHeight=724&originWidth=2224&size=194564&status=done&style=none&width=2224)


<Vssue title="jwtgen" />


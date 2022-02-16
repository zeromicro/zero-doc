# 获取用户信息(header)

# 概要


实现从header获取信息


# 请求约定


在上一节中，我们学会了怎么使用jwt进行鉴权，但是`/user/info`接口并没有定义请求参数，我们本节后规定用户信息通过请求头中通过`x-user-id`携带到服务器
格式如下


```
curl -X GET \
  http://127.0.0.1:8888/user/info \
  -H 'authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDM2MzU0OTMsImlhdCI6MTYwMzU0OTA5M30.fGNe-sAEL6NuWDPWpfVi840qsamPA3fC9h4iO3rF9v0' \
  -H 'x-user-id: 1'
```


# 完善获取用户信息逻辑


1、编辑userinfohandler.go,从header中获取用户id


```bash
$  vi book/user/api/internal/handler/userinfohandler.go
```


userinfohandler.go


```golang
package handler

import (
	"net/http"

	"book/user/api/internal/logic"
	"book/user/api/internal/svc"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func userInfoHandler(ctx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId:=r.Header.Get("x-user-id")
		l := logic.NewUserInfoLogic(r.Context(), ctx)
		resp, err := l.UserInfo(userId)
		if err != nil {
			httpx.Error(w, err)
		} else {
			httpx.OkJson(w, resp)
		}
	}
}
```


2、编辑error.go,添加errirUserNotFound错误类型


```bash
$ vi book/user/api/internal/logic/error.go
```


```
errorUserNotFound       = shared.NewDefaultError("用户不存在")
```


2、编辑userinfologic.go,填充获取用户信息逻辑


```bash
$ vi book/user/api/internal/logic/userinfologic.go
```


userinfologic.go


```bash
package logic

import (
	"book/user/model"
	"context"
	"strconv"

	"book/user/api/internal/svc"
	"book/user/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UserInfoLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUserInfoLogic(ctx context.Context, svcCtx *svc.ServiceContext) UserInfoLogic {
	return UserInfoLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UserInfoLogic) UserInfo(userId string) (*types.UserReply, error) {
	userInt, err := strconv.ParseInt(userId, 10, 64)
	if err != nil {
		return nil, err
	}

	userInfo, err := l.svcCtx.UserModel.FindOne(userInt)
	switch err {
	case nil:
		return &types.UserReply{
			Id:       userInfo.Id,
			Username: userInfo.Name,
			Mobile:   userInfo.Mobile,
			Nickname: userInfo.Nickname,
			Gender:   userInfo.Gender,
		}, nil
	case model.ErrNotFound:
		return nil, errorUserNotFound
	default:
		return nil, err
	}
}
```


# 验证


```bash
$ curl -i -X GET \
  http://127.0.0.1:8888/user/info \
  -H 'authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDM2MzU0OTMsImlhdCI6MTYwMzU0OTA5M30.fGNe-sAEL6NuWDPWpfVi840qsamPA3fC9h4iO3rF9v0' \
  -H 'x-user-id: 1'
```


![user-info.png](https://cdn.nlark.com/yuque/0/2020/png/465993/1603555677203-b4cf3af3-c437-4361-8b2b-59d8941b68df.png#align=left&display=inline&height=544&margin=%5Bobject%20Object%5D&name=user-info.png&originHeight=544&originWidth=2224&size=136083&status=done&style=none&width=2224)


<Vssue title="获取用户信息header" />

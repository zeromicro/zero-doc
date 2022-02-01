# rpc调用

# 概要


本节将通过rpc、internal api来操作课程的相关数据


# internal api（可选）


internal api指通过内网实现服务间的相互调用，使用场景一般多见于一些相对复杂的业务。其和调用rpc的区别是：rpc功能业务尽量保证单一，简单，而internal api服务面对的业务场景相对比较复杂。


internal api的调用即通过内网直接访问api协议的方式获取数据，因此这里就跳过怎么使用了。


# rpc服务创建


首先创建library、user两个rpc服务，这里就不详细描述rpc创建服务了，rpc快速开始请点击[通过goctl快速创建rpc服务](https://www.yuque.com/zeromicro/go-zero/apuyly)


这里我就直接把图书管理系统(library)和借阅系统(borrow)相关rpc服务代码上传到[github](https://github.com/anqiansong/book)中去了，可以把course模块的代码直接拿过来使用,其中使用到的table（数据表）`library`的ddl如下:


```sql
-- library
CREATE TABLE `library` (
  `id` varchar(36) NOT NULL DEFAULT '' COMMENT '书籍序列号',
  `name` varchar(255) NOT NULL DEFAULT '' COMMENT '书籍名称',
  `author` varchar(255) DEFAULT '' COMMENT '书籍作者',
  `publish_date` date DEFAULT NULL,
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```


> 注意：我们假设每本图书在图书馆中数量只存在一本，不考虑多本相同图书情况，即借图书馆、借阅系统按照书籍名称唯一处理



# 生成borrowsystemmodel


`borrow_system`表建表语句


```sql
-- borrwo_system
CREATE TABLE `borrow_system` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `book_no` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '' COMMENT '书籍号',
  `user_id` bigint NOT NULL COMMENT '借书人',
  `status` tinyint(1) DEFAULT '0' COMMENT '书籍状态，0-未归还，1-已归还',
  `return_plan_date` timestamp NOT NULL COMMENT '预计还书时间',
  `return_date` int DEFAULT '0' COMMENT '实际还书时间',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_idx` (`user_id`,`book_no`) USING BTREE,
  KEY `book_no_idx` (`book_no`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```


生成model代码


```golang
$ goctl model mysql datasource -url="user:password@tcp(127.0.0.1:3306)/gozero" -table="borrow_system" -dir ./model
```


> NOTE: `user`和`password`需要替换为实际的值

### 代码补充
```go
vi ~/book/borrow/model/borrowsystemmodel.go
```
在var上方添加
```go
const (
	_ = iota
	Borrowing
	Return
)
```
在结尾补充
```go
func (m *defaultBorrowSystemModel) FindOneByUserAndBookNo(userId int64, bookNo string) (*BorrowSystem, error) {
	query := `select ` + borrowSystemRows + ` from ` + m.table + ` where user_id = ? and book_no = ? limit 1`
	var resp BorrowSystem
	err := m.conn.QueryRow(&resp, query, userId, bookNo)
	switch err {
	case nil:
		return &resp, nil
	case sqlc.ErrNotFound:
		return nil, ErrNotFound
	default:
		return nil, err
	}
}

func (m *defaultBorrowSystemModel) FindOneByBookNo(bookNo string, status int) (*BorrowSystem, error) {
	query := `select ` + borrowSystemRows + ` from ` + m.table + ` where book_no = ? and status = ? limit 1`
	var resp BorrowSystem
	err := m.conn.QueryRow(&resp, query, bookNo, status)
	switch err {
	case nil:
		return &resp, nil
	case sqlc.ErrNotFound:
		return nil, ErrNotFound
	default:
		return nil, err
	}
}
```
填充interface方法
```go
FindOneByUserAndBookNo(userId int64, bookNo string) (*BorrowSystem, error)
FindOneByBookNo(bookNo string, status int) (*BorrowSystem, error)
```
# borrow api服务


我们通过borrow api服务来实现借阅系统相关api协议，这里可以通过前面学习的示例可以快速创建borrow api服务，这里我们们就不重复赘述了


1、新建borrow文件夹，并创建borrow.api文件


```bash
$ mkdir book/borrow && cd borrow
$ touch borrow.api
```


2、修改borrow.api文件内容，增加借书、还书协议


borrow api


```go
info(
    title: "图书借阅系统api"
    desc: "图书借阅系统api"
    author: "keson"
    email: "keson@xiaoheiban.cn"
    version: "v1.0"
)

type BorrowReq {
    BookName string `json:"bookName"`
    ReturnPlan int64 `json:"returnPlan"`
}

type ReturnReq {
    BookName string `json:"bookName"`
}

@server(
    jwt: Auth
)
service borrow-api {
    @handler borrow
    post /borrow/do (BorrowReq)

    @handler return
    post /borrow/return (ReturnReq)
}
```


代码生成


```bash
$ goctl api go -api borrow.api -dir .
```


我们看一下生成后的borrow服务的代码结构


```
└── api
    ├── borrow.api
    ├── borrow.go
    ├── etc
    │   └── borrow-api.yaml
    └── internal
        ├── config
        │   └── config.go
        ├── handler
        │   ├── borrowhandler.go
        │   ├── returnhandler.go
        │   └── routes.go
        ├── logic
        │   ├── borrowlogic.go
        │   └── returnlogic.go
        ├── svc
        │   └── servicecontext.go
        └── types
            └── types.go
```


# 添加rpc配置项


在borrow api服务中，我们将用到user.rpc和library.rpc两个rpc服务，我们先来添加一下配置项，
1、编辑config.go文件


```bash
$ vi book/borrow/api/internal/config/config.go
```


添加如下内容


```golang
Mysql struct {
    DataSource string
}
LibraryRpc zrpc.RpcClientConf
UserRpc    zrpc.RpcClientConf
```


2、编辑borrow-api.yaml


```bash
$ vi vi book/borrow/api/etc/borrow-api.yaml
```


添加配置内容


borrow-api.yaml


```yaml
Name: borrow-api
Host: 0.0.0.0
Port: 9999
Mysql:
  DataSource: user:password@tcp(127.0.0.1:3306)/gozero?charset=utf8mb4&parseTime=true&loc=Asia%2FShanghai
Auth:
  AccessSecret: ad879037-c7a4-4063-9236-6bfc35d54b7d
  AccessExpire: 86400
LibraryRpc:
  Etcd:
    Hosts:
      - 127.0.0.1:2379
    Key: library.rpc
UserRpc:
  Etcd:
    Hosts:
      - 127.0.0.1:2379
    Key: user.rpc
```


> NOTE: `user`和`password`需要替换为实际的值



# 创建rpc client


在前面我们已经把rpc的配置添加好了，接下来我们需要进行rpc client对象放入依赖对象ServiceContext


1、编辑servicecontext.go


```bash
$ vi book/borrow/api/internal/svc/servicecontext.go
```


添加UserRpc、LibraryRpc、BorrowSystemModel依赖资源


servicecontext.go


```go
package svc

import (
	"book/borrow/api/internal/config"
	"book/borrow/model"
	"book/library/rpc/libraryclient"
	"book/user/rpc/user"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
	"github.com/zeromicro/go-zero/zrpc"
)

type ServiceContext struct {
	Config            config.Config
	BorrowSystemModel model.BorrowSystemModel
	UserRpc           userclient.User
	LibraryRpc        libraryclient.Library
}

func NewServiceContext(c config.Config) *ServiceContext {
	conn := sqlx.NewMysql(c.Mysql.DataSource)
	ur := userclient.NewUser(zrpc.MustNewClient(c.UserRpc))
	lr := libraryclient.NewLibrary(zrpc.MustNewClient(c.LibraryRpc))
	return &ServiceContext{
		Config:            c,
		BorrowSystemModel: model.NewBorrowSystemModel(conn),
		UserRpc:           ur,
		LibraryRpc:        lr,
	}
}

```


# 调用rpc


1、新建error.go文件，用于标记业务错误


```bash
$ touch book/borrow/api/internal/logic/error.go
```


添加内容


```golang
package logic

import (
	"book/shared"
)

var (
	errUserNotFound = shared.NewDefaultError("用户不存在")
	errBookNotFound = shared.NewDefaultError("书籍不存在")
	errInvalidParam = shared.NewDefaultError("参数错误")
    errUserReturn   = shared.NewDefaultError("没有查询到该用户的借书记录")
    errBookBorrowed = shared.NewDefaultError("该书籍已被借阅")
)
```


2、填充借书逻辑


```bash
$ vi book/borrow/api/internal/logic/borrowlogic.go
```


borrowlogic.go#Borrow


```go
func (l *BorrowLogic) Borrow(userId string,req types.BorrowReq) error {
	userInt, err := strconv.ParseInt(fmt.Sprintf("%v", userId), 10, 64)
	if err != nil {
		return err
	}

	if req.ReturnPlan < time.Now().Unix() {
		return errInvalidParam
	}

	reply, err := l.svcCtx.UserRpc.IsUserExist(l.ctx, &user.UserExistReq{Id: userInt})
	if err != nil { // code error
		// 这里判断not found是为了有些业务场景需要使用到not found,然后进行数据更新
		// 当前业务其实可以直接返回error
		if shared.IsGRPCNotFound(err) {
			return errUserNotFound
		}
		return err
	}

	if !reply.Exists {
		return errUserNotFound
	}

	book, err := l.svcCtx.LibraryRpc.FindBookByName(l.ctx, &library.FindBookReq{Name: req.BookName})
	if err != nil { // code error
		if shared.IsGRPCNotFound(err) {
			return errBookNotFound
		}
		return err
	}

	_, err = l.svcCtx.BorrowSystemModel.FindOneByBookNo(book.No, model.Borrowing)
	switch err {
	case nil:
		return errBookBorrowed
	case model.ErrNotFound:
		_, err = l.svcCtx.BorrowSystemModel.Insert(model.BorrowSystem{
			BookNo:         book.No,
			UserId:         userInt,
			Status:         model.Borrowing,
			ReturnPlanDate: time.Unix(req.ReturnPlan, 0),
		})
		return err
	default:
		return err
	}
}
```


3、填充还书逻辑


```bash
$ vi book/borrow/api/internal/logic/returnlogic.go
```


returnlogic.go#Return


```go
func (l *ReturnLogic) Return(userId string,req types.ReturnReq) error {
	userInt, err := strconv.ParseInt(fmt.Sprintf("%v", userId), 10, 64)
	if err != nil {
		return err
	}

	book, err := l.svcCtx.LibraryRpc.FindBookByName(l.ctx, &library.FindBookReq{Name: req.BookName})
	if err != nil { // code error
		if shared.IsGRPCNotFound(err) {
			return errBookNotFound
		}
		return err
	}

	info, err := l.svcCtx.BorrowSystemModel.FindOneByUserAndBookNo(userInt, book.No)
	switch err {
    case nil:
        if info.Status == model.Return {
			return errBookReturn
		}
        info.ReturnDate = time.Now().Unix()
        info.Status = model.Return
		err = l.svcCtx.BorrowSystemModel.Update(*info)
		return err
	case model.ErrNotFound:
		return errUserReturn
	default:
		return err
	}
}
```


4、分别在returnhandler.go和borrowhandler.go中修改调用logic方法逻辑


borrowhandler.go


```golang
err := l.Borrow(r.Header.Get("x-user-id"),req)
```


retrunhandler.go


```golang
err := l.Return(r.Header.Get("x-user-id"),req)
```


至此，我们就完整rpc服务的调用，接下来我们来访问`/borrow/do`和`/borrow/return`协议来验证一下。


# 启动服务


## 启动rpc服务


启动user.rpc、library.rpc


```bash
$  go run user.go -f etc/user.yaml
```


![user-rpc.png](https://cdn.nlark.com/yuque/0/2020/png/465993/1603693376735-b06518d5-1571-4e85-9387-356c889f5032.png#align=left&display=inline&height=256&margin=%5Bobject%20Object%5D&name=user-rpc.png&originHeight=256&originWidth=2224&size=35954&status=done&style=none&width=2224)


```bash
$  go run library.go -f etc/library.yaml
```


![lib-rpc.png](https://cdn.nlark.com/yuque/0/2020/png/465993/1603693385904-13f46aaa-5973-4d6a-8f4f-e99c85361f4b.png#align=left&display=inline&height=220&margin=%5Bobject%20Object%5D&name=lib-rpc.png&originHeight=220&originWidth=2224&size=36115&status=done&style=none&width=2224)


> NOTE:启动rpc服务之前需要安装并启动etcd，etcd安装与启动可自行google



## 启动api服务


启动user.api、borrow.api服务


```bash
$ go run user.go -f etc/user-api.yaml
```


![user-api-run.png](https://cdn.nlark.com/yuque/0/2020/png/465993/1603693402379-60587956-9d21-4dd3-b318-9ccbf55e9646.png#align=left&display=inline&height=220&margin=%5Bobject%20Object%5D&name=user-api-run.png&originHeight=220&originWidth=2224&size=33973&status=done&style=none&width=2224)


```bash
$ go run borrow.go -f etc/borrow-api.yaml
```


![borrow-api.png](https://cdn.nlark.com/yuque/0/2020/png/465993/1603693419431-1c1468f0-d0d7-41ca-8fa7-bd28ad9f5088.png#align=left&display=inline&height=220&margin=%5Bobject%20Object%5D&name=borrow-api.png&originHeight=220&originWidth=2224&size=35538&status=done&style=none&width=2224)


# 访问服务


访问服务前我们插入一些书籍数据（这里不再实现图书管理系统了）


```sql
INSERT INTO library (id,name,author,publish_date) value ('5f96634494d7e147b5d25b68','go-zero微服务框架从0开始','keson','2020-10-01');
INSERT INTO library (id,name,author,publish_date) value ('5f96634494d7e147b5d25b69','go-zero微服务设计理念','keson','2020-10-01');
INSERT INTO library (id,name,author,publish_date) value ('5f96634494d7e147b5d25b6a','go-zero使用最佳实践','keson','2020-10-01');
```


1、登录


```bash
$ curl -i -X POST \
  http://127.0.0.1:8888/user/login \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
	"username":"admin",
	"password":"666666"
}'
```
> 注意：windows系统curl json需要对json进行转义。

![user-login-result.png](https://cdn.nlark.com/yuque/0/2020/png/465993/1603693464189-f5f48fac-dc9a-42e8-9c94-0be65bbc69db.png#align=left&display=inline&height=724&margin=%5Bobject%20Object%5D&name=user-login-result.png&originHeight=724&originWidth=2224&size=186515&status=done&style=none&width=2224)
2、借书


```bash
$ curl -i -X POST \
  http://127.0.0.1:9999/borrow/do \
  -H 'authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDM3NzEzNjIsImlhdCI6MTYwMzY4NDk2MiwidXNlcklkIjoxfQ.cYxttodCit_kIJw88eXsf2UpdsPsIfg_YxiN7ZNq0aE' \
  -H 'content-type: application/json' \
  -H 'x-user-id: 1' \
  -d '{
	"bookName":"go-zero微服务框架从0开始",
	"returnPlan":1603777059
}'
```
> 注意：windows系统curl json需要对json进行转义。

![curl-borrow.png](https://cdn.nlark.com/yuque/0/2020/png/465993/1603693967296-f8451f11-3bbc-485e-8723-059edf75d331.png#align=left&display=inline&height=652&margin=%5Bobject%20Object%5D&name=curl-borrow.png&originHeight=652&originWidth=2224&size=149012&status=done&style=none&width=2224)
3、还书


```bash
$ curl -i -X POST \
  http://127.0.0.1:9999/borrow/return \
  -H 'authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDM3NzEzNjIsImlhdCI6MTYwMzY4NDk2MiwidXNlcklkIjoxfQ.cYxttodCit_kIJw88eXsf2UpdsPsIfg_YxiN7ZNq0aE' \
  -H 'content-type: application/json' \
  -H 'x-user-id: 1' \
  -d '{
	"bookName":"go-zero微服务框架从0开始"
}'
```
> 注意：windows系统curl json需要对json进行转义。

![curl-return.png](https://cdn.nlark.com/yuque/0/2020/png/465993/1603693477685-bc278c41-aac6-41ad-b9aa-958d3dc560df.png#align=left&display=inline&height=616&margin=%5Bobject%20Object%5D&name=curl-return.png&originHeight=616&originWidth=2224&size=138852&status=done&style=none&width=2224)


# 参考资源


[book源码](https://github.com/anqiansong/book)


<Vssue title="rpccall" />

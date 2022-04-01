# model代码生成

# 概要


创建 `databse` 、 `table` 、生成 `model` 层代码


# 准备工作


在数据库创建一个名称为 `gozero` 的 `database` 和一张 `user` 表


`user` 表建表 `sql` 如下：


```sql
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '用户名称',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '用户密码',
  `mobile` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '手机号',
  `gender` char(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '男｜女｜未公开',
  `nickname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '用户昵称',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_index` (`name`),
  UNIQUE KEY `mobile_index` (`mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```


# 生成model代码
在 `book/user` 目录下执行


```bash
$ goctl model mysql datasource -url="root:password@tcp(127.0.0.1:3306)/gozero" -table="user" -dir ./model
```


> NOTE:如需生成带redis缓存的代码，执行



```bash
$ goctl model mysql datasource -url="root:password@tcp(127.0.0.1:3306)/gozero" -table="user" -dir ./model -c
```


NOTE: `user`和`password`需要替换为实际的值
# 修改配置文件


## 编辑 `book/user/api/internal/config/config.go` 


增加 `mysql` 配置项得到如下内容


```bash
package config

import "github.com/zeromicro/go-zero/rest"

type Config struct {
	rest.RestConf
	Mysql struct { // mysql配置
		DataSource string
	}
}
```


如需redis缓存，则还需要添加CacheRedis配置项，最后内容如下


```bash
package config

import (
	"github.com/zeromicro/go-zero/core/stores/cache"
	"github.com/zeromicro/go-zero/rest"
)

type Config struct {
	rest.RestConf
	Mysql struct {
		DataSource string
	}
	CacheRedis cache.ClusterConf
}
```


## 编辑 `book/user/api/etc/user-api.yaml` 


增加 `mysql` 配置后得到如下内容


```yaml
Name: user-api
Host: 0.0.0.0
Port: 8888
Mysql:
  DataSource: user:password@tcp(127.0.0.1:3306)/gozero?charset=utf8mb4&parseTime=true&loc=Asia%2FShanghai
```


如需redis缓存则还需要增加CacheRedis配置项，最后得到内容


```yaml
Name: user-api
Host: 0.0.0.0
Port: 8888
Mysql:
  DataSource: user:password@tcp(127.0.0.1:3306)/gozero?charset=utf8mb4&parseTime=true&loc=Asia%2FShanghai
CacheRedis:
- Host: 127.0.0.1:6379
  Pass: 
  Type: node
```


NOTE: `user`和`password`需要替换为实际的值
# 增加依赖
编辑 `book/user/api/internal/svc/servicecontext.go` ，增加 `UserModel` 依赖得到如下内容


```go
package svc

import (
	"book/user/api/internal/config"
	"book/user/model"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type ServiceContext struct {
	Config    config.Config
	UserModel model.UserModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	conn := sqlx.NewMysql(c.Mysql.DataSource)
	um := model.NewUserModel(conn)
	// redis cache 模式
	// um := NewUserModel(conn,c.CacheRedis)
	return &ServiceContext{
		Config:    c,
		UserModel: um,
	}
}
```

<Vssue title="modelgen" />


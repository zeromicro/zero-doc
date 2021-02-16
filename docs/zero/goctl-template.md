# goctl template

`goctl template`命令用于对于api、rpc、model等代码生成模板管理，方便开发人员对模板进行自定义。我们先来看一下模板长什么样子？如model代码中insert方法模板


```golang
func (m *{{.upperStartCamelObject}}Model) Insert(data {{.upperStartCamelObject}}) (sql.Result,error) {
	{{if .withCache}}{{if .containsIndexCache}}{{.keys}}
    ret, err := m.Exec(func(conn sqlx.SqlConn) (result sql.Result, err error) {
		query := fmt.Sprintf("insert into %s (%s) values ({{.expression}})", m.table, {{.lowerStartCamelObject}}RowsExpectAutoSet)
		return conn.Exec(query, {{.expressionValues}})
	}, {{.keyValues}}){{else}}query := fmt.Sprintf("insert into %s (%s) values ({{.expression}})", m.table, {{.lowerStartCamelObject}}RowsExpectAutoSet)
    ret,err:=m.ExecNoCache(query, {{.expressionValues}})
	{{end}}{{else}}query := fmt.Sprintf("insert into %s (%s) values ({{.expression}})", m.table, {{.lowerStartCamelObject}}RowsExpectAutoSet)
    ret,err:=m.conn.Exec(query, {{.expressionValues}}){{end}}
	return ret,err
}
```


其中{{.xxx}}为变量值，这里对模板语法看着有点晕的可以先看一下[go template文档介绍](https://golang.org/pkg/text/template/)


接下来我们回到`goctl template`命令的帮助信息上


```
NAME:
   goctl template - template operation

USAGE:
   goctl template command [command options] [arguments...]

COMMANDS:
   init    initialize the all templates(force update)
   clean   clean the all cache templates
   update  update template of the target category to the latest
   revert  revert the target template to the latest

OPTIONS:
   --help, -h  show help
```


# init


对模板进行初始化，如果本地已经存在模板文件，则忽略


### example


```
$ goctl template init
```


# clean


清除本地所有缓存模板


### example


```
$ goctl template clean
```


# update


更新某个分组下的所有模板为最新的模板内容，其可以通过一个`category`标志符来指定分组


```
NAME:
   goctl template update - update template of the target category to the latest

USAGE:
   goctl template update [command options] [arguments...]

OPTIONS:
   --category value, -c value  the category of template, enum [api,rpc,model]
```


`--category`：目前支持api/rpc/model三个分组的模板


### example


更新model分组下所有模板


```
$ goctl template update -c model
```


# revert


回滚指定模板文件到最新模板内容，该命令多用于修复已经被改坏的模板，无法正常生成代码的情况，其会通过`--category`和`--name`标志符来指定某一分组下的某一模板文件


```
NAME:
   goctl template revert - revert the target template to the latest

USAGE:
   goctl template revert [command options] [arguments...]

OPTIONS:
   --category value, -c value  the category of template, enum [api,rpc,model]
   --name value, -n value      the target file name of template
```


`--category`：目前支持api/rpc/model三个分组的模板
`--name`：模板文件名称


### example


如回滚api分组下的config.tpl模板


```
$ goctl template revert -c api -name config.tpl
```


# 模板存放位置


模板文件存放于$USERHOME目录的.goctl文件夹中


对于类UNIX系统，模板存放在`~/.goctl`目录下，如我当前系统下的模板文件


```
.
├── api
│   ├── config.tpl
│   ├── context.tpl
│   ├── etc.tpl
│   ├── handler.tpl
│   ├── logic.tpl
│   └── main.tpl
├── model
│   ├── delete.tpl
│   ├── err.tpl
│   ├── filed.tpl
│   ├── find-one-by-field.tpl
│   ├── find-one-by-filed-extra-method.tpl
│   ├── find-one.tpl
│   ├── import-no-cache.tpl
│   ├── import.tpl
│   ├── insert.tpl
│   ├── model-new.tpl
│   ├── model.tpl
│   ├── tag.tpl
│   ├── types.tpl
│   ├── update.tpl
│   └── var.tpl
└── rpc
    ├── call-func.tpl
    ├── call-interface-func.tpl
    ├── call-types.tpl
    ├── call.tpl
    ├── config.tpl
    ├── etc.tpl
    ├── logic-func.tpl
    ├── logic.tpl
    ├── main.tpl
    ├── server-func.tpl
    ├── server.tpl
    ├── svc.tpl
    └── template.tpl
```


对于windows则存在于`C:\Users\$user\.goctl`下


> NOTE: $user为window用户名称



# 模板修改


对于一些开发人员，可能会对预设模板的一些命名风格或者规范不符合胃口，你可以用过修改模板来实现自定义模板，当然修改模板还是要遵循一些规范：


- 不能修改模板中变量名称
- 为了保证代码生成正确性，不建议删除变量



### 修改模板示例


我们这里通过一个ddl来演示一下model代码生成，首先看一下模板修改前生成的insert方法代码


user.sql


```sql
-- 用户表 --
CREATE TABLE `user` (
  `id` bigint(10) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '用户名称',
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '用户密码',
  `mobile` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '手机号',
  `gender` char(5) COLLATE utf8mb4_general_ci NOT NULL COMMENT '男｜女｜未公开',
  `nickname` varchar(255) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '用户昵称',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_index` (`name`),
  UNIQUE KEY `mobile_index` (`mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```


```bash
goctl model mysql ddl -src user.sql  -dir=.
```


usermodel.go#Insert


```golang
func (m *UserModel) Insert(data User) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (%s) values (?, ?, ?, ?, ?)", m.table, userRowsExpectAutoSet)
	ret, err := m.conn.Exec(query, data.Name, data.Password, data.Mobile, data.Gender, data.Nickname)
	return ret, err
}
```


上文中`Insert`为预设模板生成的代码，现在我们来修改一下`Insert`模板方法名`InsertData`，并添加一行docment `I am from custom template`


```
$ vi ~/.goctl/model/insert.tpl
```


修改模板后内容如下


```golang
// I am from custom template
func (m *{{.upperStartCamelObject}}Model) InsertData(data {{.upperStartCamelObject}}) (sql.Result,error) {
	{{if .withCache}}{{if .containsIndexCache}}{{.keys}}
    ret, err := m.Exec(func(conn sqlx.SqlConn) (result sql.Result, err error) {
		query := fmt.Sprintf("insert into %s (%s) values ({{.expression}})", m.table, {{.lowerStartCamelObject}}RowsExpectAutoSet)
		return conn.Exec(query, {{.expressionValues}})
	}, {{.keyValues}}){{else}}query := fmt.Sprintf("insert into %s (%s) values ({{.expression}})", m.table, {{.lowerStartCamelObject}}RowsExpectAutoSet)
    ret,err:=m.ExecNoCache(query, {{.expressionValues}})
	{{end}}{{else}}query := fmt.Sprintf("insert into %s (%s) values ({{.expression}})", m.table, {{.lowerStartCamelObject}}RowsExpectAutoSet)
    ret,err:=m.conn.Exec(query, {{.expressionValues}}){{end}}
	return ret,err
}
```


重新生成代码


```bash
goctl model mysql ddl -src user.sql  -dir=.
```


发现`Insert`模板修改已经生效了


```golang
// I am from custom template
func (m *UserModel) InsertData(data User) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (%s) values (?, ?, ?, ?, ?)", m.table, userRowsExpectAutoSet)
	ret, err := m.conn.Exec(query, data.Name, data.Password, data.Mobile, data.Gender, data.Nickname)
	return ret, err
}
```


<Vssue title="goctltemplate" />

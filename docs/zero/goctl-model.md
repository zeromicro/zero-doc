# goctl model

`goctl model`命令用于model层代码生成，目前暂时仅支持根据`mysql`指定ddl和datasource来生成。


```shell
$ goctl model -h

NAME:
   goctl model - generate model code

USAGE:
   goctl model command [command options] [arguments...]

COMMANDS:
   mysql  generate mysql model

OPTIONS:
   --help, -h  show help
```


从上文中得知，目前可支持`mysql`自命令，即根据mysql数据库ddl和url生成model代码，我们来看看其子命令的帮助信息


```shell
$ goctl model mysql -h

NAME:
   goctl model mysql - generate mysql model

USAGE:
   goctl model mysql command [command options] [arguments...]

COMMANDS:
   ddl         generate mysql model from ddl
   datasource  generate model from datasource

OPTIONS:
   --help, -h  show help
```


在上文中我们定义了两个子命令`ddl`和`datasource`


# ddl


即通过mysql的ddl语句来生成代码，目前仅限制`create table`


```bash
$ goctl model mysql ddl -h

NAME:
   goctl model mysql ddl - generate mysql model from ddl

USAGE:
   goctl model mysql ddl [command options] [arguments...]

OPTIONS:
   --src value, -s value  the path or path globbing patterns of the ddl
   --dir value, -d value  the target dir
   --style value          the file naming format, see [https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]
   --cache, -c            generate code with cache [optional]
   --idea                 for idea plugin [optional]
```


- `--src`：指定sql文件名（含路径），支持相对路径，支持通配符匹配
- `--dir`：指定代码存放的目标文件夹
- `--style`：指定生成文件名命名方式，参考[config](https://github.com/zeromicro/go-zero/blob/master/tools/goctl/config/readme.md)
- `--cache`：指定缓存方式，true：生成带redis缓存代码，false：生成不带redis缓存代码，默认：false
- `--idea`：略



### example


指定文件名user.sql


```
$ goctl model mysql ddl -src user.sql  -dir=./model
```


通配符匹配所有sql文件


```bash
$ goctl model mysql ddl -src "*.sql"  -dir=./model
```


# datasource


通过指定mysql连接地址来生成model代码


```bash
$ goctl model mysql datasource -h

NAME:
   goctl model mysql datasource - generate model from datasource

USAGE:
   goctl model mysql datasource [command options] [arguments...]

OPTIONS:
   --url value              the data source of database,like "root:password@tcp(127.0.0.1:3306)/database
   --table value, -t value  the table or table globbing patterns in the database
   --cache, -c              generate code with cache [optional]
   --dir value, -d value    the target dir
   --style value            the file naming format, see [https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]
   --idea                   for idea plugin [optional]

```


- `--url`：指定数据库连接地址，如`user:password@tcp(127.0.0.1:3306)/gozero`
- `--table`：指定表名，支持通配符匹配，即匹配`gozero`数据库中的表
- `--dir`：指定代码存放的目标文件夹
- `--style`：指定生成文件名命名方式，参考[config](https://github.com/zeromicro/go-zero/blob/master/tools/goctl/config/readme.md)
- `--cache`：指定缓存方式，true：生成带redis缓存代码，false：生成不带redis缓存代码，默认：false
- `--idea`：略



### example


指定表名user


```
$ goctl model mysql datasource -url="user:password@tcp(127.0.0.1:3306)/gozero" -table="user" -dir ./model
```


通配符匹配所有user开头的表


```
$ goctl model mysql datasource -url="user:password@tcp(127.0.0.1:3306)/gozero" -table="user*" -dir ./model
```


# 注意事项


- 1、为了避免解析错误，请尽量使用标准的ddl语法进行生成
- 2、不支持fulltext全文索引，解析会报错
- 3、不生成联合唯一索引的findOne
- 4、不生成分页查询代码


<Vssue title="goctlmodel" />


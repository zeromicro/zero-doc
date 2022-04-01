# model生成
首先，下载好[演示工程](https://github.com/zeromicro/go-zero-pages/raw/master/cn/resource/book.zip) 后，我们以user的model来进行代码生成演示。

## 前言
model是服务访问持久化数据层的桥梁，业务的持久化数据常存在于mysql，mongo等数据库中，我们都知道，对于一个数据库的操作莫过于CURD，
而这些工作也会占用一部分时间来进行开发，我曾经在编写一个业务时写了40个model文件，根据不同业务需求的复杂性，平均每个model文件差不多需要
10分钟，对于40个文件来说，400分钟的工作时间，差不多一天的工作量，而goctl工具可以在10秒钟来完成这400分钟的工作。

## 准备工作
进入演示工程book，找到user/model下的user.sql文件，将其在你自己的数据库中执行建表。

## 代码生成(带缓存)
### 方式一(ddl)
进入`service/user/model`目录，执行命令
```shell
$ cd service/user/model
$ goctl model mysql ddl -src user.sql -dir . -c
```
```text
Done.
```

### 方式二(datasource)
```shell
$ goctl model mysql datasource -url="$datasource" -table="user" -c -dir .
```
```text
Done.
```
> [!TIP]
> $datasource为数据库连接地址

### 方式三(intellij 插件)
在Goland中，右键`user.sql`，依次进入并点击`New`->`Go Zero`->`Model Code`即可生成，或者打开`user.sql`文件，
进入编辑区，使用快捷键`Command+N`（for mac OS）或者 `alt+insert`（for windows），选择`Mode Code`即可

![model生成](https://zeromicro.github.io/go-zero-pages/resource/intellij-model.png)

> [!TIP]
> intellij插件生成需要安装goctl插件，详情见[intellij插件](intellij.md)

## 验证生成的model文件
查看tree
```shell
$ tree
```
```text
.
├── user.sql
├── usermodel.go
└── vars.go
```

## 更多
对于持久化数据，如果需要更灵活的数据库能力，包括事务能力，可以参考 [Mysql](mysql.md)

如果需要分布式事务的能力，可以参考 [分布式事务支持](distributed-transaction.md)

# 猜你想看
[model命令及其原理](goctl-model.md)

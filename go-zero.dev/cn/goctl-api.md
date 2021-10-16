# api命令
goctl api是goctl中的核心模块之一，其可以通过.api文件一键快速生成一个api服务，如果仅仅是启动一个go-zero的api演示项目，
你甚至都不用编码，就可以完成一个api服务开发及正常运行。在传统的api项目中，我们要创建各级目录，编写结构体，
定义路由，添加logic文件，这一系列操作，如果按照一条协议的业务需求计算，整个编码下来大概需要5～6分钟才能真正进入业务逻辑的编写，
这还不考虑编写过程中可能产生的各种错误，而随着服务的增多，随着协议的增多，这部分准备工作的时间将成正比上升，
而goctl api则可以完全替代你去做这一部分工作，不管你的协议要定多少个，最终来说，只需要花费10秒不到即可完成。

> [!TIP]
> 其中的结构体编写，路由定义用api进行替代，因此总的来说，省去的是你创建文件夹、添加各种文件及资源依赖的过程的时间。

## api命令说明
```shell
$ goctl api -h
```
```text
NAME:
   goctl api - generate api related files

USAGE:
   goctl api command [command options] [arguments...]

COMMANDS:
   new       fast create api service
   format    format api files
   validate  validate api file
   doc       generate doc files
   go        generate go files for provided api in yaml file
   java      generate java files for provided api in api file
   ts        generate ts files for provided api in api file
   dart      generate dart files for provided api in api file
   kt        generate kotlin code for provided api file
   plugin    custom file generator

OPTIONS:
   -o value    the output api file
   --help, -h  show help
```

从上文中可以看到，根据功能的不同，api包含了很多的自命令和flag，我们这里重点说明一下
`go`子命令，其功能是生成golang api服务，我们通过`goctl api go -h`看一下使用帮助：
```shell
$ goctl api go -h
```
```text
NAME:
   goctl api go - generate go files for provided api in yaml file

USAGE:
   goctl api go [command options] [arguments...]

OPTIONS:
   --dir value    the target dir
   --api value    the api file
   --style value  the file naming format, see [https://github.com/tal-tech/go-zero/tree/master/tools/goctl/config/readme.md]
```

* --dir 代码输出目录
* --api 指定api源文件
* --style 指定生成代码文件的文件名称风格，详情见[文件名称命名style说明](https://github.com/tal-tech/go-zero/tree/master/tools/goctl/config/readme.md)

## 使用示例
```shell
$ goctl api go -api user.api -dir . -style gozero
```


# 猜你想看
* [api语法](api-grammar.md)
* [api目录](api-dir.md)
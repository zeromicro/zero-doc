# 概念介绍

## go-zero
晓黑板golang开源项目，集各种工程实践于一身的web和rpc框架。

## goctl
一个旨在为开发人员提高工程效率、降低出错率的辅助工具。

## goctl插件
指以goctl为中心的周边二进制资源，能够满足一些个性化的代码生成需求，如路由合并插件`goctl-go-compact`插件，
生成swagger文档的`goctl-swagger`插件，生成php调用端的`goctl-php`插件等。

## intellij/vscode插件
在intellij系列产品上配合goctl开发的插件，其将goctl命令行操作使用UI进行替代。

## api文件
api文件是指用于定义和描述api服务的文本文件，其以.api后缀结尾，包含api语法描述内容。

## goctl环境
goctl环境是使用goctl前的准备环境，包含
* golang环境
* protoc
* protoc-gen-go插件
* go module | gopath

## go-zero-demo
go-zero-demo里面包含了文档中所有源码的一个大仓库，后续我们在编写演示demo时，我们均在此项目下创建子项目，
因此我们需要提前创建一个大仓库`go-zero-demo`，我这里把这个仓库放在home目录下。
```shell
$ cd ~
$ mkdir go-zero-demo&&cd go-zero-demo
$ go mod init go-zero-demo
```


# 参考文档
* [go-zero](README.md)
* [Goctl](goctl.md)
* [插件中心](plugin-center.md)
* [工具中心](tool-center.md)
* [api语法](api-grammar.md)
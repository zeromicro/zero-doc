# goctl overview

# goctl概述


goctl是[go-zero](https://github.com/tal-tech/go-zero)微服务框架下的代码生成工具，其可以快速提升开发效率，让开发人员将时间重点放在业务coding上，其具体功能如下：


- [api服务生成](https://www.yuque.com/tal-tech/go-zero/ppnpng)
- [rpc服务生成](https://www.yuque.com/tal-tech/go-zero/hlxlbt)
- [model代码生成](https://www.yuque.com/tal-tech/go-zero/nkg20f)
- [模板管理](https://www.yuque.com/tal-tech/go-zero/mkpuit)



# go C-T-L?


很多人会把goctl读作go-C-T-L,这种是错误的念法，正确念做`go-control`


# 版本查看


```bash
$  goctl -v
```


如果安装了`goctl`则会输出一下格式的文本信息


```
goctl version ${version} ${os}/${arch}
```


输出示例


```bash
goctl version xxxxxx darwin/amd64
```


- `version`：goctl 版本号
- `os`：当前操作系统名称
- `arch`： 当前系统架构名称



# goctl安装


### 方式一（go get）


```bash
$ GO111MODULE=on GOPROXY=https://goproxy.cn/,direct go get -u github.com/tal-tech/go-zero/tools/goctl
```


通过此命令可以将goctl工具安装到`$GOPATH/bin`目录下


### 方式二 （fork and build）


从[go-zero](https://github.com/tal-tech/go-zero)拉取一份go-zero源码`git@github.com:tal-tech/go-zero.git`，进入goctl（`tools/goctl/`）目录下编译一下goctl文件，然后将其添加到环境变量中。


# 校验


安装完成后执行`goctl -v`如果输出版本信息则代表安装成功


```
$ goctl -v
```


输出结果示例


```bash
goctl version xxxxxx darwin/amd64
```


# 常见问题


### 1、command not found: goctl


此错误多见于goctl并未添加到环境变量中。


<Vssue title="goctloverview" />

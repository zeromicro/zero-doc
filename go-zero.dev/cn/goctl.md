# Goctl

goctl是go-zero微服务框架下的代码生成工具。使用 goctl 可显著提升开发效率，让开发人员将时间重点放在业务开发上，其功能有：

- api服务生成
- rpc服务生成
- model代码生成
- 模板管理

本节将包含以下内容：

* [命令大全](goctl-commands.md)
* [api命令](goctl-api.md)
* [rpc命令](goctl-rpc.md)
* [model命令](goctl-model.md)
* [plugin命令](goctl-plugin.md)
* [其他命令](goctl-other.md)

## goctl 读音
很多人会把 `goctl` 读作 `go-C-T-L`，这种是错误的念法，应参照 `go control` 读做 `ɡō kənˈtrōl`。

## 查看版本信息
```shell
$  goctl -v
```

如果安装了goctl则会输出以下格式的文本信息：

```text
goctl version ${version} ${os}/${arch}
```

例如输出：
```text
goctl version 1.1.5 darwin/amd64
```

版本号说明
* version：goctl 版本号
* os：当前操作系统名称
* arch： 当前系统架构名称

## 安装 goctl

### 方式一（go get）

```shell
$ GO111MODULE=on GOPROXY=https://goproxy.cn/,direct go get -u github.com/tal-tech/go-zero/tools/goctl
```

通过此命令可以将goctl工具安装到 `$GOPATH/bin` 目录下

### 方式二 （fork and build）

从 go-zero代码仓库 `git@github.com:tal-tech/go-zero.git` 拉取一份源码，进入 `tools/goctl/`目录下编译一下 goctl 文件，然后将其添加到环境变量中。

安装完成后执行`goctl -v`，如果输出版本信息则代表安装成功，例如：

```shell
$ goctl -v

goctl version 1.1.4 darwin/amd64
```

## 常见问题
```
command not found: goctl
```
请确保goctl已经安装，或者goctl是否已经正确添加到当前shell的环境变量中。

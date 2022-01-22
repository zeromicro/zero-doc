---
sidebar_position: 0
---

# 准备工作

在正式进入实际开发之前，我们需要做一些准备工作，比如：Go环境的安装，grpc代码生成使用的工具安装， 必备工具Goctl的安装，Golang环境配置等

## Golang环境安装

开发golang程序，必然少不了对其环境的安装，我们这里选择以1.15.1为例。

### 官方文档
[https://golang.google.cn/doc/install](https://golang.google.cn/doc/install)

### mac OS安装Go

* 下载并安装[Go for Mac](https://dl.google.com/go/go1.15.1.darwin-amd64.pkg)
* 验证安装结果
    ```shell
    $ go version
    ```
    ```text
    go version go1.15.1 darwin/amd64
    ```
### linux 安装Go
* 下载[Go for Linux](https://golang.org/dl/go1.15.8.linux-amd64.tar.gz)
* 解压压缩包至`/usr/local`
    ```shell
    $ tar -C /usr/local -xzf go1.15.8.linux-amd64.tar.gz
    ```
* 添加`/usr/local/go/bin`到环境变量
    ```shell
    $ $HOME/.profile
    ```
    ```shell
    export PATH=$PATH:/usr/local/go/bin
    ```
    ```shell
    $ source $HOME/.profile
    ```
* 验证安装结果
    ```shell
    $ go version
    ```
    ```text
    go version go1.15.1 linux/amd64
    ```
### Windows安装Go
* 下载并安装 [Go for Windows](https://golang.org/dl/go1.15.8.windows-amd64.msi)
* 验证安装结果
    ```shell
    $ go version
    ```
    ```text
    go version go1.15.1 windows/amd64
    ```

### 其他

更多操作系统安装见 [https://golang.org/dl/](https://golang.org/dl/)

## Go Module设置

### Go Module介绍
> Modules are how Go manages dependencies.[1]

即Go Module是Golang管理依赖性的方式，像Java中的Maven，Android中的Gradle类似。

### MODULE配置
* 查看`GO111MODULE`开启情况
    ```shell
    $ go env GO111MODULE
    ```
    ```text
    on
    ```
* 开启`GO111MODULE`，如果已开启（即执行`go env GO111MODULE`结果为`on`）请跳过。
    ```shell
    $ go env -w GO111MODULE="on"
    ```
* 设置GOPROXY
    ```shell
    $ go env -w GOPROXY=https://goproxy.cn
    ```
* 设置GOMODCACHE
  
    查看GOMODCACHE
    ```shell
    $ go env GOMODCACHE
    ```
    如果目录不为空或者`/dev/null`，请跳过。
    ```shell
    go env -w GOMODCACHE=$GOPATH/pkg/mod
    ```
  
## Goctl安装

Goctl在go-zero项目开发着有着很大的作用，其可以有效的帮助开发者大大提高开发效率，减少代码的出错率，缩短业务开发的工作量，更多的Goctl的介绍请阅读[Goctl介绍](goctl.md),
在这里我们强烈推荐大家安装，因为后续演示例子中我们大部分都会以goctl进行演示。

### 安装(mac&linux)
* download&install
    ```shell
    # Go 1.15 及之前版本
    GO111MODULE=on GOPROXY=https://goproxy.cn/,direct go get -u github.com/tal-tech/go-zero/tools/goctl@latest

    # Go 1.16 及以后版本
    GOPROXY=https://goproxy.cn/,direct go install github.com/tal-tech/go-zero/tools/goctl@latest
    ```
* 环境变量检测

`go get`下载编译后的二进制文件位于`$GOPATH/bin`目录下，要确保`$GOPATH/bin`已经添加到环境变量。
```shell
$ sudo vim /etc/paths
```
在最后一行添加如下内容
```text
$GOPATH/bin
```
:::tip
`$GOPATH`为你本机上的文件地址 
:::
                                                                                                                                                                                               
* 安装结果验证
```shell
$ goctl -v
```
```text
goctl version 1.1.4 darwin/amd64
```
:::tip
windows用户添加环境变量请自行google
:::

## protoc & protoc-gen-go安装

protoc是一款用C++编写的工具，其可以将proto文件翻译为指定语言的代码。在go-zero的微服务中，我们采用grpc进行服务间的通信，而grpc的编写就需要用到protoc和翻译成go语言rpc stub代码的插件protoc-gen-go。

本文演示环境
* mac OS
* protoc 3.14.0

### protoc安装

* 进入[protobuf release](https://github.com/protocolbuffers/protobuf/releases) 页面，选择适合自己操作系统的压缩包文件
* 解压`protoc-3.14.0-osx-x86_64.zip`并进入`protoc-3.14.0-osx-x86_64`
    ```shell
    $ cd protoc-3.14.0-osx-x86_64/bin
    ```
* 将启动的`protoc`二进制文件移动到被添加到环境变量的任意path下，如`$GOPATH/bin`，这里不建议直接将其和系统的以下path放在一起。
```shell
$ mv protoc $GOPATH/bin
```
:::tip
$GOPATH为你本机的实际文件夹地址
:::                                                                                                                                  
                                                                                                                                             
* 验证安装结果
    ```shell
    $ protoc --version
    ```
    ```shell
    libprotoc 3.14.0
    ```
  
### protoc-gen-go 安装
* 下载安装`protoc-gen-go`

  如果goctl 版本已经是1.2.1以后了，可以忽略此步骤。
    ```shell
    $ go get -u github.com/golang/protobuf/protoc-gen-go@v1.3.2
    ```
    ```text
    go: found github.com/golang/protobuf/protoc-gen-go in github.com/golang/protobuf v1.4.3
    go: google.golang.org/protobuf upgrade => v1.25.0
    ```
* 将protoc-gen-go移动到被添加环境变量的任意path下，如`$GOPATH/bin`，由于`go get`后的二进制本身就在`$GOPATH/bin`目录中，因此只要确保你的`$GOPATH/bin`在环境变量即可。

## 其他

在之前我们已经对Go环境、Go Module配置、Goctl、protoc&protoc-gen-go安装准备就绪，这些是开发人员在开发阶段必须要准备的环境，而接下来的环境你可以选择性的安装， 因为这些环境一般存在于服务器（安装工作运维会替你完成），但是为了后续演示流程能够完整走下去，我建议大家在本地也安装一下，因为我们的演示环境大部分会以本地为主。 以下仅给出了需要的准备工作，不以文档篇幅作详细介绍了。

* [etcd](https://etcd.io/docs/current/rfc/v3api/)
* [redis](https://redis.io/)
* [mysql](https://www.mysql.com/)
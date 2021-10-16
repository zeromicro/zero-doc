# protoc & protoc-gen-go安装

## 前言
protoc是一款用C++编写的工具，其可以将proto文件翻译为指定语言的代码。在go-zero的微服务中，我们采用grpc进行服务间的通信，而grpc的编写就需要用到protoc和翻译成go语言rpc stub代码的插件protoc-gen-go。

本文演示环境
* mac OS
* protoc 3.14.0

## protoc安装

* 进入[protobuf release](https://github.com/protocolbuffers/protobuf/releases) 页面，选择适合自己操作系统的压缩包文件
* 解压`protoc-3.14.0-osx-x86_64.zip`并进入`protoc-3.14.0-osx-x86_64`
    ```shell
    $ cd protoc-3.14.0-osx-x86_64/bin
    ```
* 将启动的`protoc`二进制文件移动到被添加到环境变量的任意path下，如`$GOPATH/bin`，这里不建议直接将其和系统的以下path放在一起。
    ```shell
    $ mv protoc $GOPATH/bin
    ```
    > [!TIP]
    > $GOPATH为你本机的实际文件夹地址
* 验证安装结果
    ```shell
    $ protoc --version
    ```
    ```shell
    libprotoc 3.14.0
    ```
  
## protoc-gen-*安装
在goctl版本大于1.2.1时，则不需要安装 `protoc-gen-go` 插件了，因为在该版本以后，goctl已经实现了作为 `protoc` 的插件了，goctl在指定 `goctl xxx` 命令时会自动
将 `goctl` 创建一个符号链接 `protoc-gen-goctl` ，在生成pb.go时会按照如下逻辑生成：
1. 检测环境变量中是否存在 `protoc-gen-goctl` 插件，如果是，则跳转到第3步
2. 检测环境变量中是否存在 `protoc-gen-go` 插件，如果不存在，则生成流程结束
3. 根据检测到的插件生成pb.go

> [!TIPS]
> 
> Windows 在创建符号链接可能会报错， `A required privilege is not held by the client.`, 原因是在Windows下执行goctl需要"以管理员身份"运行。
> 

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

> **[!WARNING]
> protoc-gen-go安装失败请阅读[常见错误处理](error.md)

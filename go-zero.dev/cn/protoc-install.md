# protoc & protoc-gen-go安装

## 前言
protoc是一款用C++编写的工具，其可以将proto文件翻译为指定语言的代码。在go-zero的微服务中，我们采用grpc进行服务间的通信，而grpc的编写就需要用到protoc和翻译成go语言rpc stub代码的插件protoc-gen-go。

本文演示环境
* mac OS

## protoc安装

* 进入[protobuf release](https://github.com/protocolbuffers/protobuf/releases) 页面，选择适合自己操作系统的压缩包文件
* 解压`protoc-x.x.x-osx-x86_64.zip`并进入`protoc-x.x.x-osx-x86_64`
    ```shell
    $ cd protoc-x.x.x-osx-x86_64/bin
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
    libprotoc x.x.x
    ```

## protoc-gen-go 安装
* 下载安装`protoc-gen-go`
    ```shell
    $ go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.26
    $ go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.1
    ```

* 将protoc-gen-go移动到被添加环境变量的任意path下，如`$GOPATH/bin`，由于`go get`后的二进制本身就在`$GOPATH/bin`目录中，因此只要确保你的`$GOPATH/bin`在环境变量即可。

> [!WARNING]
> protoc-gen-go安装失败请阅读[常见错误处理](error.md)

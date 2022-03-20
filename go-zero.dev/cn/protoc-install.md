# protoc & protoc-gen-go安装

## 前言
protoc是一款用C++编写的工具，其可以将proto文件翻译为指定语言的代码。在go-zero的微服务中，我们采用grpc进行服务间的通信，而grpc的编写就需要用到protoc和翻译成go语言rpc stub代码的插件protoc-gen-go。

* mac OS
## 方式一：goctl一键安装

```bash
$ goctl env check -i -f                                  
[goctl-env]: preparing to check env

[goctl-env]: looking up "protoc"
[goctl-env]: "protoc" is not found in PATH
[goctl-env]: preparing to install "protoc"
"protoc" installed from cache
[goctl-env]: "protoc" is already installed in "/Users/keson/go/bin/protoc"

[goctl-env]: looking up "protoc-gen-go"
[goctl-env]: "protoc-gen-go" is not found in PATH
[goctl-env]: preparing to install "protoc-gen-go"
"protoc-gen-go" installed from cache
[goctl-env]: "protoc-gen-go" is already installed in "/Users/keson/go/bin/protoc-gen-go"

[goctl-env]: looking up "protoc-gen-go-grpc"
[goctl-env]: "protoc-gen-go-grpc" is not found in PATH
[goctl-env]: preparing to install "protoc-gen-go-grpc"
"protoc-gen-go-grpc" installed from cache
[goctl-env]: "protoc-gen-go-grpc" is already installed in "/Users/keson/go/bin/protoc-gen-go-grpc"

[goctl-env]: congratulations! your goctl environment is ready!
```

## 方式二： 源文件安装

### protoc安装

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

### protoc-gen-go/protoc-gen-go-grpc 安装
* 下载安装`protoc-gen-go`
    ```shell
    $ go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
    $ go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
    ```

> [!WARNING]
> protoc-gen-go安装失败请阅读[常见错误处理](error.md)

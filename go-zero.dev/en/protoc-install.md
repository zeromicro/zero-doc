# protoc & protoc-gen-go安装
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

## Forward
protoc is a tool written in C++, which can translate proto files into codes in the specified language. In the go-zero microservices, we use grpc to communicate between services, and the writing of grpc requires the use of protoc and the plug-in protoc-gen-go that translates into go language rpc stub code.

Demonstration environment of this document
* mac OS
* protoc 3.14.0

## protoc installation

* Enter the [protobuf release](https://github.com/protocolbuffers/protobuf/releases) page and select the compressed package file suitable for your operating system
* Unzip `protoc-3.14.0-osx-x86_64.zip` and enter `protoc-3.14.0-osx-x86_64`
    ```shell
    $ cd protoc-3.14.0-osx-x86_64/bin
    ```
* Move the started `protoc` binary file to any path added to the environment variable, such as `$GOPATH/bin`. It is not recommended putting it directly with the next path of the system.
    ```shell
    $ mv protoc $GOPATH/bin
    ```
    > [!TIP]
    > $GOPATH is the actual folder address of your local machine
* Verify the installation result
    ```shell
    $ protoc --version
    ```
    ```shell
    libprotoc 3.14.0
    ```
## protoc-gen-* installation

> [!TIPS]
>
> Windows may report an error, `A required privilege is not held by the client.`, because goctl needs to be run `as administrator` under Windows.
>The reason is that goctl needs to be run "as administrator" under Windows.
* Download and install `protoc-gen-go`

  If the goctl version is already 1.2.1 or later, you can ignore this step.

    ```shell
    $ go get -u github.com/golang/protobuf/protoc-gen-go@v1.3.2
    ```
    ```text
    go: found github.com/golang/protobuf/protoc-gen-go in github.com/golang/protobuf v1.4.3
    go: google.golang.org/protobuf upgrade => v1.25.0
    ```
* Move protoc-gen-go to any path where environment variables are added, such as `$GOPATH/bin`, because the binary itself after `go get` is in the `$GOPATH/bin` directory, so just make sure your `$GOPATH/bin` can be in the environment variable.

> **[!WARNING]
> protoc-gen-go installation failed, please read [Error](error.md)

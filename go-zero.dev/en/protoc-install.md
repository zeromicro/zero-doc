# protoc & protoc-gen-go installation
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

## Forward
protoc is a tool written in C++, which can translate proto files into codes in the specified language. In the go-zero microservices, we use grpc to communicate between services, and the writing of grpc requires the use of protoc and the plug-in protoc-gen-go that translates into go language rpc stub code.

Demonstration environment of this document
* mac OS

## way 1: install from goctl
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

## way2: install from web page

### protoc installation

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
### protoc-gen-* installation

> [!TIPS]
>
> Windows may report an error, `A required privilege is not held by the client.`, because goctl needs to be run `as administrator` under Windows.
>The reason is that goctl needs to be run "as administrator" under Windows.
* Download and install `protoc-gen-go`
    ```shell
    $ go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
    $ go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
    ```

> **[!WARNING]
> protoc-gen-go installation failed, please read [Error](error.md)

---
sidebar_position: 0
---

# Preparation work

Before we enter the actual development, we need to do some preparation work, such as: Go environment installation, grpc code generation tools installation, the installation of essential tools Goctl, Golang environment configuration, etc.

## Golang environment installation

To develop a golang program, you must install the environment, we choose to take 1.15.1 as an example.

### Official documentation
[https://golang.google.cn/doc/install](https://golang.google.cn/doc/install)

### mac OS installation of Go

* Download and install [Go for Mac](https://dl.google.com/go/go1.15.1.darwin-amd64.pkg)
* Verify the installation result
    ```shell
    $ go version
    ```
    ```text
    go version go1.15.1 darwin/amd64
    ```
### linux install Go
* Download [Go for Linux](https://golang.org/dl/go1.15.8.linux-amd64.tar.gz)
* Unzip the archive to ``/usr/local`''
    ```shell
    $ tar -C /usr/local -xzf go1.15.8.linux-amd64.tar.gz
    ```
* Add `/usr/local/go/bin` to the environment variable
    ```shell
    $ $HOME/.profile
    ```
    ```shell
    export PATH=$PATH:/usr/local/go/bin
    ```
    ```shell
    $ source $HOME/.profile
    ```
* Verify the installation result
    ```shell
    $ go version
    ```
    ```text
    go version go1.15.1 linux/amd64
    ```
### Windows installation of Go
* Download and install [Go for Windows](https://golang.org/dl/go1.15.8.windows-amd64.msi)
* Verify the installation result
    ```shell
    $ go version
    ```
    ```text
    go version go1.15.1 windows/amd64
    ```

### Other

For more OS installations see [https://golang.org/dl/](https://golang.org/dl/)

## Go Module Setup

### Introduction to Go Module
> Modules are how Go manages dependencies.[1]

That is, Go Module is how Golang manages dependencies, similar to Maven in Java and Gradle in Android.

### MODULE configuration
* Check if `GO111MODULE` is on
    ```shell
    $ go env GO111MODULE
    ```
    ```text
    on
    ```
* Enable ``GO111MODULE``, skip if it is enabled (i.e. ``go env GO111MODULE`` results in ``on``).
    ```shell
    $ go env -w GO111MODULE="on"
    ```
* Set GOPROXY
    ```shell
    $ go env -w GOPROXY=https://goproxy.cn
    ```
* Set GOMODCACHE
  
    View GOMODCACHE
    ```shell
    $ go env GOMODCACHE
    ```
    If the directory is not empty or ``/dev/null``, skip it.
    ```shell
    go env -w GOMODCACHE=$GOPATH/pkg/mod
    ```
  
## Goctl installation

Goctl has a great role in go-zero project development, it can effectively help developers to greatly improve development efficiency, reduce the error rate of the code, shorten the workload of business development, for more information about Goctl, please read [Goctl Introduction](goctl.md),
Here we highly recommend you to install it, because most of our subsequent demo examples will be demonstrated with goctl.

### Installation (mac&linux)
* download&install
    ```shell
    # Go 1.15 and earlier
    GO111MODULE=on GOPROXY=https://goproxy.cn/,direct go get -u github.com/tal-tech/go-zero/tools/goctl@latest

    # Go 1.16 and later
    GOPROXY=https://goproxy.cn/,direct go install github.com/tal-tech/go-zero/tools/goctl@latest
    ```
* Environment variable detection

``go get`` downloads the compiled binaries located in the `$GOPATH/bin` directory, make sure `$GOPATH/bin` has been added to the environment variables.
```shell
$ sudo vim /etc/paths
```
Add the following to the last line
```text
$GOPATH/bin
```
:::tip
``$GOPATH`` is the address of the file on your local machine 
:::
                                                                                                                                                                                               
* Installation result verification
```shell
$ goctl -v
```
```text
goctl version 1.1.4 darwin/amd64
```
:::tip
Add environment variables for windows users, please google it yourself
:::

## protoc & protoc-gen-go installation

protoc is a tool written in C++ that translates proto files into code in a given language. In go-zero microservices, we use grpc to communicate between services, and the writing of grpc requires the use of protoc and the plugin protoc-gen-go which translates into go language rpc stub code.

This article demonstrates the environment
* mac OS
* protoc 3.14.0

### protoc installation

* Go to the [protobuf release](https://github.com/protocolbuffers/protobuf/releases) page and select the appropriate zip file for your operating system
* Unzip `protoc-3.14.0-osx-x86_64.zip` and go to `protoc-3.14.0-osx-x86_64`
    ``shell
    $ cd protoc-3.14.0-osx-x86_64/bin
    ```
* Move the startup `protoc` binary to any path that is added to the environment variable, such as `$GOPATH/bin`, it is not recommended here to put it directly with the following paths of the system.
```shell
$ mv protoc $GOPATH/bin
```
:::tip
$GOPATH is the actual folder address on your local machine
:::                                                                                                                                  
                                                                                                                                             
* Verify the installation result
    ```shell
    $ protoc --version
    ```
    ```shell
    libprotoc 3.14.0
    ```
  
### protoc-gen-go installation
* Download and install `protoc-gen-go`

  If the goctl version is already 1.2.1 or later, you can ignore this step.
    ```shell
    $ go get -u github.com/golang/protobuf/protoc-gen-go@v1.3.2
    ```
    ```text
    go: found github.com/golang/protobuf/protoc-gen-go in github.com/golang/protobuf v1.4.3
    go: google.golang.org/protobuf upgrade => v1.25.0
    ```
* Move protoc-gen-go to any path where the environment variable is being added, such as `$GOPATH/bin`. Since the binary itself after `go get` is in the `$GOPATH/bin` directory, just make sure your `$GOPATH/bin` is in the environment variable.

## Other

We have already prepared Go environment, Go Module configuration, Goctl, protoc & protoc-gen-go installation, these are the environments that developers must prepare in the development phase, and the next environments you can selectively install, because these environments generally exist on the server (installation work will be done for you by operations), but in order to follow I recommend that you install them locally, because most of our demo environments will be local. The following only gives the required preparation work, not the length of the document for a detailed introduction.

* [etcd](https://etcd.io/docs/current/rfc/v3api/)
* [redis](https://redis.io/)
* [mysql](https://www.mysql.com/)
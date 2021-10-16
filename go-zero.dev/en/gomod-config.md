# Go Module Configuration
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

## Introduction to Go Module
> Modules are how Go manages dependencies.[1]

That is, Go Module is a way for Golang to manage dependencies, similar to Maven in Java and Gradle in Android.

## Module configuration
* Check the status of `GO111MODULE`
    ```shell
    $ go env GO111MODULE
    ```
    ```text
    on
    ```
* Turn on `GO111MODULE`, if it is already turned on (that is, execute `go env GO111MODULE` and the result is `on`), please skip it.
    ```shell
    $ go env -w GO111MODULE="on"
    ```
* Set up `GOPROXY`
    ```shell
    $ go env -w GOPROXY=https://goproxy.cn
    ```
* Set up `GOMODCACHE`
  
    view `GOMODCACHE`
    ```shell
    $ go env GOMODCACHE
    ```
  If the directory is not empty or `/dev/null`, please skip it.
    ```shell
    go env -w GOMODCACHE=$GOPATH/pkg/mod
    ```


# Reference
[1] [Go Modules Reference](https://golang.google.cn/ref/mod)
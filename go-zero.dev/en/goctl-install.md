# Goctl Installation
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

## Foreword
Goctl plays a very important role in the development of the go-zero project. It can effectively help developers greatly improve development efficiency, reduce code error rate, and shorten the workload of business development. For more introductions to Goctl, please read [Goctl Introduction ](goctl.md),

Here we strongly recommend that you install it, because most of the follow-up demonstration examples will use goctl for demonstration.

## Install(mac&linux)
* download&install
    ```shell
    # Go 1.15 及之前版本
    GO111MODULE=on go get -u github.com/tal-tech/go-zero/tools/goctl@latest

    # Go 1.16 及以后版本
    go install github.com/tal-tech/go-zero/tools/goctl@latest
    ```
* Environmental variable detection

  The compiled binary file downloaded by `go get` is located in the `$GOPATH/bin` directory. Make sure that `$GOPATH/bin` has been added to the environment variable.
    ```shell
    $ sudo vim /etc/paths
    ```
  Add the following in the last line
    ```text
    $GOPATH/bin
    ```
    > [!TIP]
    > `$GOPATH` is the filepath on your local machine

* Installation result verification
    ```shell
    $ goctl -v
    ```
    ```text
    goctl version 1.1.4 darwin/amd64
    ```
  
> [!TIP]
> For windows users to add environment variables, please Google by yourself.

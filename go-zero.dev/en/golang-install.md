# Golang Installation
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

## Forward
To develop a golang program, the installation of its environment must be indispensable. Here we choose to take 1.15.1 as an example.

## Official document
[https://golang.google.cn/doc/install](https://golang.google.cn/doc/install)

## Install Go on macOS

* Download and install [Go for Mac](https://dl.google.com/go/go1.15.1.darwin-amd64.pkg)
* Verify the installation result
    ```shell
    $ go version
    ```
    ```text
    go version go1.15.1 darwin/amd64
    ```
## Install Go on linux
* Download [Go for Linux](https://golang.org/dl/go1.15.8.linux-amd64.tar.gz)
* Unzip the compressed package to `/usr/local`
    ```shell
    $ tar -C /usr/local -xzf go1.15.8.linux-amd64.tar.gz
    ```
* Add `/usr/local/go/bin` to environment variables
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
## Install Go on windows
* Download and install [Go for Windows](https://golang.org/dl/go1.15.8.windows-amd64.msi)
* Verify the installation result
    ```shell
    $ go version
    ```
    ```text
    go version go1.15.1 windows/amd64
    ```

## More
For more operating system installation, see [https://golang.org/dl/](https://golang.org/dl/)

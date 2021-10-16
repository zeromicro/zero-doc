# Golang环境安装

## 前言
开发golang程序，必然少不了对其环境的安装，我们这里选择以1.15.1为例。

## 官方文档
[https://golang.google.cn/doc/install](https://golang.google.cn/doc/install)

## mac OS安装Go

* 下载并安装[Go for Mac](https://dl.google.com/go/go1.15.1.darwin-amd64.pkg)
* 验证安装结果
    ```shell
    $ go version
    ```
    ```text
    go version go1.15.1 darwin/amd64
    ```
## linux 安装Go
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
## Windows安装Go
* 下载并安装[Go for Windows](https://golang.org/dl/go1.15.8.windows-amd64.msi)
* 验证安装结果
    ```shell
    $ go version
    ```
    ```text
    go version go1.15.1 windows/amd64
    ```

## 其他
更多操作系统安装见[https://golang.org/dl/](https://golang.org/dl/)

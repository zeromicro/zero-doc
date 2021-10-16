# Go Module设置

## Go Module介绍
> Modules are how Go manages dependencies.[1]

即Go Module是Golang管理依赖性的方式，像Java中的Maven，Android中的Gradle类似。

## MODULE配置
* 查看`GO111MODULE`开启情况
    ```shell
    $ go env GO111MODULE
    ```
    ```text
    on
    ```
* 开启`GO111MODULE`，如果已开启（即执行`go env GO111MODULE`结果为`on`）请跳过。
    ```shell
    $ go env -w GO111MODULE="on"
    ```
* 设置GOPROXY
    ```shell
    $ go env -w GOPROXY=https://goproxy.cn
    ```
* 设置GOMODCACHE
  
    查看GOMODCACHE
    ```shell
    $ go env GOMODCACHE
    ```
    如果目录不为空或者`/dev/null`，请跳过。
    ```shell
    go env -w GOMODCACHE=$GOPATH/pkg/mod
    ```


# 参考文档
[1] [Go Modules Reference](https://golang.google.cn/ref/mod)
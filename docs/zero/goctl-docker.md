# goctl docker

本篇介绍如何使用 `goctl` 极速生成一个 `Dockerfile` 
## Dockerfile 额外注意点


- 选择最简单的镜像：比如alpine，整个镜像5M左右

- 设置镜像时区



```dockerfile
RUN apk add --no-cache tzdata
ENV TZ Asia/Shanghai
```
## 多阶段构建


- 第一阶段构建否则构建出可执行文件，确保构建过程独立于宿主机

- 第二阶段将第一阶段的输出作为输入，构建出最终的极简镜像

## Dockerfile编写过程


- 首先安装 `goctl` 工具
```dockerfile
GO111MODULE=on GOPROXY=https://goproxy.cn/,direct go get -u github.com/tal-tech/go-zero/tools/goctl
```

- 在 `greet` 项目下创建一个 `hello` 服务

```bash
goctl api new hello
```
文件结构如下：
```
greet
├── go.mod
├── go.sum
└── service
    └── hello
        ├── Dockerfile
        ├── etc
        │   └── hello-api.yaml
        ├── hello.api
        ├── hello.go
        └── internal
            ├── config
            │   └── config.go
            ├── handler
            │   ├── hellohandler.go
            │   └── routes.go
            ├── logic
            │   └── hellologic.go
            ├── svc
            │   └── servicecontext.go
            └── types
                └── types.go
```


- 在 `hello` 目录下一键生成 `Dockerfile`
```bash
goctl docker -go greet.go
```
`Dockerfile` 内容如下：


```dockerfile
FROM golang:alpine AS builder

LABEL stage=gobuilder

ENV CGO_ENABLED 0
ENV GOOS linux
ENV GOPROXY https://goproxy.cn,direct

WORKDIR /build/zero

ADD go.mod .
ADD go.sum .
RUN go mod download
COPY . .
COPY service/hello/etc /app/etc
RUN go build -ldflags="-s -w" -o /app/hello service/hello/hello.go


FROM alpine

RUN apk update --no-cache
RUN apk add --no-cache ca-certificates
RUN apk add --no-cache tzdata
ENV TZ Asia/Shanghai

WORKDIR /app
COPY --from=builder /app/hello /app/hello
COPY --from=builder /app/etc /app/etc

CMD ["./hello", "-f", "etc/hello-api.yaml"]
```


- 在 `greet` 目录下 `build` 镜像

```bash
docker build -t hello:v1 -f service/hello/Dockerfile .
```

- 查看镜像
```bash
hello v1 5455f2eaea6b 7 minutes ago 18.1MB
```
可以看出镜像大小约为18M。


- 启动服务

```bash
docker run --rm -it -p 8888:8888 hello:v1
```

- 测试服务
```
$ curl -i http://localhost:8888/from/you
HTTP/1.1 200 OK
Content-Type: application/json
Date: Thu, 10 Dec 2020 06:03:02 GMT
Content-Length: 14
{"message":""}
```
## 总结


`goctl` 工具极大简化了 `Dockerfile` 文件的编写，提供了开箱即用的最佳实践，并且支持了模板自定义。


<Vssue title="goctldocker" />

# 常见错误处理

## Windows上报错
```text
A required privilege is not held by the client.
```
解决方法："以管理员身份运行" goctl 即可。

## grpc引起错误
* 错误一
  ```text
  protoc-gen-go: unable to determine Go import path for "greet.proto"
  
  Please specify either:
  • a "go_package" option in the .proto source file, or
  • a "M" argument on the command line.
  
  See https://developers.google.com/protocol-buffers/docs/reference/go-generated#package for more information.
  
  --go_out: protoc-gen-go: Plugin failed with status code 1.
  
  ```
   解决方法：
   ```text
   go get -u github.com/golang/protobuf/protoc-gen-go@v1.3.2
   ```
  
## protoc-gen-go安装失败
```text
go get github.com/golang/protobuf/protoc-gen-go: module github.com/golang/protobuf/protoc-gen-go: Get "https://proxy.golang.org/github.com/golang/protobuf/protoc-gen-go/@v/list": dial tcp 216.58.200.49:443: i/o timeout
```

请确认`GOPROXY`已经设置,GOPROXY设置见[go module配置](gomod-config.md)

## api服务启动失败
```text
error: config file etc/user-api.yaml, error: type mismatch for field xx
```

请确认`user-api.yaml`配置文件中配置项是否已经配置，如果有值，检查一下yaml配置文件是否符合yaml格式。

## goctl找不到
```
command not found: goctl
```
请确保goctl已经安装或者goctl是否已经添加到环境变量
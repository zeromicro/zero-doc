---
sidebar_position: 1
---

# 常见问题

### windows上报错
```text
A required privilege is not held by the client.
```
解决方法："以管理员身份运行" goctl 即可。

### grpc引起错误
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
  
### protoc-gen-go安装失败
```text
go get github.com/golang/protobuf/protoc-gen-go: module github.com/golang/protobuf/protoc-gen-go: Get "https://proxy.golang.org/github.com/golang/protobuf/protoc-gen-go/@v/list": dial tcp 216.58.200.49:443: i/o timeout
```

请确认`GOPROXY`已经设置

### api服务启动失败
```text
error: config file etc/user-api.yaml, error: type mismatch for field xx
```

请确认`user-api.yaml`配置文件中配置项是否已经配置，如果有值，检查一下yaml配置文件是否符合yaml格式。

### goctl找不到
```
command not found: goctl
```
请确保goctl已经安装或者goctl是否已经添加到环境变量

### goctl已安装却提示 `command not found: goctl`
如果你通过 `go get` 方式安装，那么 `goctl` 应该位于 `$GOPATH` 中，你可以通过 `go env GOPATH` 查看完整路径，不管你的 `goctl` 是在 `$GOPATH`中，还是在其他目录，出现上述问题的原因就是 `goctl` 所在目录不在 `PATH` (环境变量)中所致。

### proto使用了import，goctl命令需要怎么写
`goctl` 对于import的proto指定 `BasePath` 提供了 `protoc` 的flag映射，即 `--proto_path, -I`，`goctl` 会将此flag值传递给 `protoc`.

### 假设 `base.proto` 的被main proto 引入了，为什么不生能生成`base.pb.go`
对于 `base.proto` 这种类型的文件，一般都是开发者有message复用的需求，他的来源不止有开发者自己编写的`proto`文件，还有可能来源于 `google.golang.org/grpc` 中提供的一些基本的proto,比如 `google/protobuf/any.proto`, 如果由 `goctl`来生成，那么就失去了集中管理这些proto的意义。

### model怎么控制缓存时间
在 `sqlc.NewNodeConn` 的时候可以通过可选参数 `cache.WithExpiry` 传递，如缓存时间控制为1天，代码如下:
```go 
sqlc.NewNodeConn(conn,redis,cache.WithExpiry(24*time.Hour))  
```
   
### 怎么关闭输出的统计日志(stat)？
```go
logx.DisableStat()
```

### rpc直连与服务发现连接模式写法
   ```go
   // mode1: 集群直连
   // conf:=zrpc.NewDirectClientConf([]string{"ip:port"},"app","token")
	
   // mode2: etcd 服务发现
   // conf:=zrpc.NewEtcdClientConf([]string{"ip:port"},"key","app","token")
   // client, _ := zrpc.NewClient(conf)
	
   // mode3: ip直连mode
   // client, _ := zrpc.NewClientWithTarget("127.0.0.1:8888")
   ```
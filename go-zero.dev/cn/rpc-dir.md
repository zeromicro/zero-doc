# rpc服务目录

## proto 文件
greet.proto
```protobuf
syntax = "proto3";

package stream;

option go_package = "./greet";

message StreamReq {
  string name = 1;
}

message StreamResp {
  string greet = 1;
}

service StreamGreeter {
  rpc greet(StreamReq) returns (StreamResp);
}
```
### goctl rpc proto
```shell
$ goctl rpc protoc greet.proto --go_out=. --go-grpc_out=. --zrpc_out=.                                                                                               
[goctl-env]: preparing to check env

[goctl-env]: looking up "protoc"
[goctl-env]: "protoc" is installed

[goctl-env]: looking up "protoc-gen-go"
[goctl-env]: "protoc-gen-go" is installed

[goctl-env]: looking up "protoc-gen-go-grpc"
[goctl-env]: "protoc-gen-go-grpc" is installed

[goctl-env]: congratulations! your goctl environment is ready!
[command]: protoc greet.proto --go_out=. --go-grpc_out=.
Done.
```
生成的目录结构

```text
.
├── etc
│   └── greet.yaml
├── go.mod
├── go.sum
├── greet // [1]
│   ├── greet.pb.go
│   └── greet_grpc.pb.go
├── greet.go
├── greet.proto
├── internal
│   ├── config
│   │   └── config.go
│   ├── logic
│   │   └── greetlogic.go
│   ├── server
│   │   └── streamgreeterserver.go
│   └── svc
│       └── servicecontext.go
└── streamgreeter
    └── streamgreeter.go
```
[1] pb.go & _grpc.pb.go 文件所在目录并非固定，该目录有 `go_opt & go-grpc_opt` 与 proto文件中的 `go_package` 值共同决定，想要了解grpc代码生成目录逻辑请阅读 [Go Generated Code](https://developers.google.com/protocol-buffers/docs/reference/go-generated)
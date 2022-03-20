# RPC Directory Structure
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

## proto
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
$ GOCTL_DeBUG=true goctl rpc protoc greet.proto --go_out=. --go-grpc_out=. --zrpc_out=.                                                                                               
[goctl-env]: preparing to check env

[goctl-env]: looking up "protoc"
[goctl-env]: "protoc" is installed

[goctl-env]: looking up "protoc-gen-go"
[Goctl-env]: "protoc-gen-go" is installed

[goctl-env]: looking up "protoc-gen-go-grpc"
[goctl-env]: "protoc-gen-go-grpc" is installed

[goctl-env]: congratulations, your goctl environment is ready!
[command]: protoc greet.proto --go_out=. --go-grpc_out=.
Done.
```

> 温馨提示
>
> `goctl rpc protoc` 指令在非debug模式下不会输出日志了，如需开启debug模式，可以用 `goctl env -w GOCTL_DEBUG=true`

dir structure:

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
[1] The directory where the `pb.go & _grpc.pb.go` files are located is not fixed, it is determined by `go_opt & go-grpc_opt` in conjunction with the `go_package` value in the proto file, to understand the logic of the grpc code generation directory read [Go Generated Code](https://developers.google.com/protocol-buffers/docs/reference/go-generated)
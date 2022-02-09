# rpc服务目录

## proto 文件
greet.proto
```shell
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
以下为旧指令 `goctl rpc proto ...` 
```shell
$ goctl rpc proto -src greet.proto -dir .
```
生成的目录结构

```text
.
├── etc             // yaml配置文件
│   └── greet.yaml
├── go.mod
├── greet           // pb.go文件夹①
│   └── greet.pb.go
├── greet.go        // main函数
├── greet.proto     // proto 文件
├── greetclient     // call logic ②
│   └── greet.go
└── internal        
    ├── config      // yaml配置对应的实体
    │   └── config.go
    ├── logic       // 业务代码
    │   └── pinglogic.go
    ├── server      // rpc server
    │   └── greetserver.go
    └── svc         // 依赖资源
        └── servicecontext.go
```

> [!TIP]
> ① pb文件夹名（老版本文件夹固定为pb）称取自于proto文件中option go_package的值最后一层级按照一定格式进行转换，若无此声明，则取自于package的值，大致代码如下：

```go
  if option.Name == "go_package" {
    ret.GoPackage = option.Constant.Source
  }
  ...
  if len(ret.GoPackage) == 0 {
    ret.GoPackage = ret.Package.Name
  }
  ret.PbPackage = GoSanitized(filepath.Base(ret.GoPackage))
  ...
```
> [!TIP]
> GoSanitized方法请参考google.golang.org/protobuf@v1.25.0/internal/strs/strings.go:71

> [!TIP]
> ② call 层文件夹名称取自于proto中service的名称，如该sercice的名称和pb文件夹名称相等，则会在srervice后面补充client进行区分，使pb和call分隔。

```go
if strings.ToLower(proto.Service.Name) == strings.ToLower(proto.GoPackage) {
	callDir = filepath.Join(ctx.WorkDir, strings.ToLower(stringx.From(proto.Service.Name+"_client").ToCamel()))
}
```
### goctl rpc protoc
当 goctl 版本大于等于 `1.3.0` 时，按照如下指令生成
```shell
goctl rpc protoc greet.proto --go_out=. --go-grpc_out=. --zrpc_out=.
```
目录结构如下

```text
.
├── etc
│   └── greet.yaml
├── go.mod
├── greet // ① 
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
└── streamgreeter // ②
    └── streamgreeter.go
```

以上目录和 `goctl rpc proto` 生成的区别在于：
`goctl rpc proto` 是 goctl 控制输出目录，用户不可通过参数灵活指定
而 `goctl rpc protoc` 生成是由 `protoc` 和 `protoc-gen-go` 或者 `protoc-gen-grpc-go`(如果安装且`protoc-gen-go`为 google 仓库维护的版本)
来决定，用户自行掌握，`goctl` 只负责 zrpc 目录的控制；

因此上文的目录中  ① ② 名称并非固定的，是取决于 proto 文件中的 `package` | `option xx_package` 和 `service` 名称分别决定。

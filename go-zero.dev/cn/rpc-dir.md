# rpc服务目录

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
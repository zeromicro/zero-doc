# RPC Directory Structure
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

```text
.
├── etc             // yaml configuration file
│   └── greet.yaml
├── go.mod
├── greet           // pb.go folder①
│   └── greet.pb.go
├── greet.go        // main entry
├── greet.proto     // proto source file
├── greetclient     // call logic ②
│   └── greet.go
└── internal        
    ├── config      // yaml configuration corresponding entity
    │   └── config.go
    ├── logic       // Business code
    │   └── pinglogic.go
    ├── server      // rpc server
    │   └── greetserver.go
    └── svc         // Dependent resources
        └── servicecontext.go
```

> [!TIP]
> ① The name of the pb folder (the old version folder is fixed as pb) is taken from the value of option go_package in the proto file. The last level is converted according to a certain format. If there is no such declaration, it is taken from the value of package. The approximate code is as follows:

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
> For GoSanitized method, please refer to google.golang.org/protobuf@v1.25.0/internal/strs/strings.go:71

> [!TIP]
> ② The name of the call layer folder is taken from the name of the service in the proto. If the name of the sercice is equal to the name of the pb folder, the client will be added after service to distinguish between pb and call.

```go
if strings.ToLower(proto.Service.Name) == strings.ToLower(proto.GoPackage) {
	callDir = filepath.Join(ctx.WorkDir, strings.ToLower(stringx.From(proto.Service.Name+"_client").ToCamel()))
}
```
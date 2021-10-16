# Error
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

## Error reporting on Windows
```text
A required privilege is not held by the client.
```text
Solution: "Run as administrator" goctl will work.

## grpc error
* Case 1
  ```text
  protoc-gen-go: unable to determine Go import path for "greet.proto"
  
  Please specify either:
  • a "go_package" option in the .proto source file, or
  • a "M" argument on the command line.
  
  See https://developers.google.com/protocol-buffers/docs/reference/go-generated#package for more information.
  
  --go_out: protoc-gen-go: Plugin failed with status code 1.
  
  ```
  Solution:
   ```text
   go get -u github.com/golang/protobuf/protoc-gen-go@v1.3.2
   ```
  
## protoc-gen-go installation failed
```text
go get github.com/golang/protobuf/protoc-gen-go: module github.com/golang/protobuf/protoc-gen-go: Get "https://proxy.golang.org/github.com/golang/protobuf/protoc-gen-go/@v/list": dial tcp 216.58.200.49:443: i/o timeout
```

Please make sure `GOPROXY` has been set, see [Go Module Configuration](gomod-config.md) for GOPROXY setting

## api service failed to start
```text
error: config file etc/user-api.yaml, error: type mismatch for field xx
```

Please confirm whether the configuration items in the `user-api.yaml` configuration file have been configured. If there are values, check whether the yaml configuration file conforms to the yaml format.

## command not found: goctl
```
command not found: goctl
```
Please make sure that goctl has been installed or whether goctl has been added to the environment variable
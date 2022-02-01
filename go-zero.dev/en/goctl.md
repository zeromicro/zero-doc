# Goctl
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

goctl is a code generation tool under the go-zero microservice framework. Using goctl can significantly improve development efficiency and allow developers to focus their time on business development. Its functions include:

- api service generation
- rpc service generation
- model code generation
- template management

This section will contain the following:

* [Commands & Flags](goctl-commands.md)
* [API Commands](goctl-api.md)
* [RPC Commands](goctl-rpc.md)
* [Model Commands](goctl-model.md)
* [Plugin Commands](goctl-plugin.md)
* [More Commands](goctl-other.md)

## goctl？
Many people will pronounce `goctl` as `go-C-T-L`. This is a wrong way of thinking. You should refer to `go control` and pronounce `ɡō kənˈtrōl`.

## View version information
```shell
$  goctl -v
```

If goctl is installed, it will output text information in the following format:

```text
goctl version ${version} ${os}/${arch}
```

For example output:
```text
goctl version 1.1.5 darwin/amd64
```

Version number description
* version: goctl version number
* os: Current operating system name
* arch: Current system architecture name

## Install goctl

### The way one（go get）

```shell
$ GO111MODULE=on GOPROXY=https://goproxy.cn/,direct go get -u github.com/zeromicro/go-zero/tools/goctl
```

Use this command to install the goctl tool into the `GOPATHbin` directory

### The way two （fork and build）

Pull a source code from the go-zero code repository `git@github.com:zeromicro/go-zero.git`, enter the `tools/goctl` directory to compile the goctl file, and then add it to the environment variable.

After the installation is complete, execute `goctl -v`. If the version information is output, the installation is successful, for example:

```shell
$ goctl -v

goctl version 1.1.4 darwin/amd64
```

## FAQ
```
command not found: goctl
```
Please make sure that goctl has been installed, or whether goctl has been correctly added to the environment variables of the current shell.

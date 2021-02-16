# goctl rpc

# goctl rpc


`goctl rpc`命令可以根据proto文件生成rpc服务代码，具体功能如下：


```
NAME:
   goctl rpc - generate rpc code

USAGE:
   goctl rpc command [command options] [arguments...]

COMMANDS:
   new       generate rpc demo service
   template  generate proto template
   proto     generate rpc from proto

OPTIONS:
   --help, -h  show help
```


如上文所示，其包含`new`、`template`、`proto`三个自命令


# new


一键生成greet rpc服务，生成后代码无需配置直接运行，真正0coding创建一个名称为`greet`的rpc服务,我们再来看看该命令的使用帮助说明


```bash
$ goctl rpc new -h
```


```go
NAME:
   goctl rpc new - generate rpc demo service

USAGE:
   goctl rpc new [command options] [arguments...]

OPTIONS:
   --style value  the file naming format, see [https://github.com/tal-tech/go-zero/tree/master/tools/goctl/config/readme.md]
   --idea         whether the command execution environment is from idea plugin. [optional]

```


> NOTE: `--idea`标志为可选参数，用于idea中插件使用，控制一些log输出格式，终端使用时可忽略，下文中的`--idea`功能一样。



### example


```bash
$ goctl rpc new greet
```


# template


生成一个proto文件，其内容为预设的proto内容，用此命令可以节省编写`syntax="proto${version}"`、 `package ${name}` `rpc service`等结构块代码，提升proto定义效率。在`template`下还有一些标识控制，根据帮助信息可得知


```
$ goctl rpc template -h
```


```go
NAME:
   goctl rpc template - generate proto template

USAGE:
   goctl rpc template [command options] [arguments...]

OPTIONS:
   --out value, -o value  the target path of proto
```


`--out`: 指定模板文件名


### example


```bash
$ goctl rpc template -o greet.proto
```


# proto


根据指定proto文件生成rpc服务,在`proto`下还有很多自命令，我们查看一下帮助信息


```bash
$ goctl rpc proto -h
```


```bash
NAME:
   goctl rpc proto - generate rpc from proto

USAGE:
   goctl rpc proto [command options] [arguments...]

OPTIONS:
   --src value, -s value         the file path of the proto source file
   --proto_path value, -I value  native command of protoc, specify the directory in which to search for imports. [optional]
   --dir value, -d value         the target path of the code
   --style value                 the file naming format, see [https://github.com/tal-tech/go-zero/tree/master/tools/goctl/config/readme.md]
   --idea                        whether the command execution environment is from idea plugin. [optional]

```


从上文可得知，其中包含了


- `--src`：proto文件名，支持相对路径
- `--proto_path`：protoc原生命令，proto import查找目录
- `--dir`：生成代码的目标文件夹
- `--style`：指定文件名称format格式
- `--idea`：略



### example


```bash
$ goctl rpc proto -I $GOPATH/src -src transform.proto -dir .
```


# proto import


在使用goctl的前提下，proto的import需要遵循一定规范


## 规范


- rpc request&return 不能为外部import的message。



# rpc服务目录树


```bash
.
├── etc							// yaml配置文件
│   └── greet.yaml
├── go.mod
├── greet						// pb.go文件夹①
│   └── greet.pb.go
├── greet.go				// main函数
├── greet.proto			// proto 文件
├── greetclient			// call logic ②
│   └── greet.go
└── internal				
    ├── config			// yaml配置对应的实体
    │   └── config.go
    ├── logic				// 业务代码
    │   └── pinglogic.go
    ├── server			// rpc server
    │   └── greetserver.go
    └── svc					// 依赖资源
        └── servicecontext.go
```


> ① pb文件夹名（~~老版本文件夹固定为pb~~）称取自于proto文件中option go_package的值最后一层级按照一定格式进行转换，若无此声明，则取自于package的值，大致代码如下：

```bash
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
> GoSanitized方法请参考_google.golang.org/protobuf@v1.25.0/internal/strs/strings.go:71_



> ② call 层文件夹名称取自于proto中service的名称，如该service的名称和pb文件夹名称相等，则会在service后面补充client进行区分，使pb和call分隔。
> 


```bash
if strings.ToLower(proto.Service.Name) == strings.ToLower(proto.GoPackage) {
	callDir = filepath.Join(ctx.WorkDir, strings.ToLower(stringx.From(proto.Service.Name+"_client").ToCamel()))
}
```


<Vssue title="goctlrpc" />


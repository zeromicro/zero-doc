---
sidebar_position: 2
---

# Build API

If you just start a `go-zero` `api` demo project, you can develop an api service and run it normally without even coding. In a traditional api project, we have to create all levels of directories, write structures, define routes, add `logic` files, and this series of operations, if we calculate the business requirements of a protocol, it takes about 5-6 minutes to code the whole thing before we can really get into writing the business logic, and this does not take into account the various errors that may occur during the writing process, and as the number of services, as the number of protocols This part of the preparation time will rise proportionally as the number of services and protocols increases, but the `goctl api` can completely replace you to do this part of the work, no matter how many protocols you have to set, in the end, it will take less than 10 seconds to complete.

:::tip 

where the structs are written and the route definitions are replaced with api, so all in all, what is saved is your time in the process of creating folders, adding various files and resource dependencies.

:::

### api command description

```shell
$ goctl api -h
```
```text
NAME:
   goctl api - generate api related files

USAGE:
   goctl api command [command options] [arguments...]

COMMANDS:
   new       fast create api service
   format    format api files
   validate  validate api file
   doc       generate doc files
   go        generate go files for provided api in yaml file
   java      generate java files for provided api in api file
   ts        generate ts files for provided api in api file
   dart      generate dart files for provided api in api file
   kt        generate kotlin code for provided api file
   plugin    custom file generator

OPTIONS:
   -o value    the output api file
   --help, -h  show help
```

As you can see from the above, depending on the function, the api contains a lot of self-commands and flags, which we focus on here
`go` subcommand, its function is to generate golang api service, we look at the usage help by `goctl api go -h`:

```shell
$ goctl api go -h
```
```text
NAME:
   goctl api go - generate go files for provided api in yaml file

USAGE:
   goctl api go [command options] [arguments...]

OPTIONS:
   --dir value    the target dir
   --api value    the api file
   --style value  the file naming format, see [https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]
```

* --dir code output directory
* --api Specify the api source file
* --style Specify the file name style of the generated code file, see [file name naming style description](https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md) for details

### Usage examples
```shell
$ goctl api go -api user.api -dir . -style gozero
```




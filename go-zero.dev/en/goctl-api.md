# API Commands
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

goctl api is one of the core modules in goctl. It can quickly generate an api service through the .api file with one click. If you just start a go-zero api demo project,
You can complete an api service development and normal operation without even coding. In traditional api projects, we have to create directories at all levels, write structures,
Define routing, add logic files, this series of operations, if calculated according to the business requirements of a protocol, it takes about 5 to 6 minutes for the entire coding to actually enter the writing of business logic.
This does not consider the various errors that may occur during the writing process. With the increase of services and the increase of agreements, the time for this part of the preparation work will increase proportionally.
The goctl api can completely replace you to do this part of the work, no matter how many agreements you have, in the end, it only takes less than 10 seconds to complete.

> [!TIP]
> The structure is written, and the route definition is replaced by api, so in general, it saves you the time of creating folders, adding various files and resource dependencies.

## API command description
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

As you can see from the above, according to the different functions, the api contains a lot of self-commands and flags, let’s focus on it here
The `go` subcommand, which function is to generate golang api services, let's take a look at the usage help through `goctl api go -h`:
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

* --dir: Code output directory
* --api: Specify the api source file
* --style: Specify the file name style of the generated code file, see for details [https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md](https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md)

## Usage example
```shell
$ goctl api go -api user.api -dir . -style gozero
```

# Guess you wants
* [API IDL](api-grammar.md)
* [API Directory Structure](api-dir.md)
# goctl command list
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)


![goctl](https://zeromicro.github.io/go-zero/en/resource/goctl-command.png)

# goctl

## api
(api service related operations)

### -o
(Generate api file)

- Example: goctl api -o user.api

### new
(Quickly create an api service)

- Example: goctl api new user

### format
(api format, vscode use)

- -dir
  (Target directory)
- -iu
  (Whether to automatically update goctl)
- -stdin
  (Whether to read data from standard input)

### validate
(Verify that the api file is valid)

- -api
  (Specify the api file source)

    - Example: goctl api validate -api user.api

### doc
(Generate doc markdown)

- -dir
  (Specify the directory)

    - Example: goctl api doc -dir user

### go
(Generate golang api service)

- -dir
  (Specify the code storage directory)
- -api
  (Specify the api file source)
- -force
  (Whether to force overwrite existing files)
- -style
  (Specify the file name naming style, `gozero`: lowercase, `go_zero`: underscore, `GoZero`: camel case)

### java
(Generate access api service code-java language)

- -dir
  (Specify the code storage directory)
- -api
  (Specify the api file source)

### ts
(Generate access api service code-ts language)

- -dir
  (Specify the code storage directory)
- -api
  (Specify the api file source)
- webapi
- caller
- unwrap

### dart
(Generate access api service code-dart language)

- -dir
  (Specify code storage target)
- -api
  (Specify the api file source)

### kt
(Generate access api service code-Kotlin language)

- -dir
  (Specify code storage target)
- -api
  (Specify the api file source)
- -pkg
  (Specify package name)

### plugin

- -plugin
  Executable file
- -dir
  Code storage destination folder
- -api
  api source file
- -style
  File name formatting

## template
(Template operation)

### init
(Cache api/rpc/model template)

- Example: goctl template init

### clean
(清空缓存模板)

- Example: goctl template clean

### update
(Update template)

- -category,c
  (Specify the group name that needs to be updated api|rpc|model)

    - Example: goctl template update -c api

### revert
(Restore the specified template file)

- -category,c
  (Specify the group name that needs to be updated api|rpc|model)
- -name,n
  (Specify the template file name)

## config
(Configuration file generation)

### -path,p
(Specify the configuration file storage directory)

- Example: goctl config -p user

## docker
(Generate Dockerfile)

### -go
(Specify the main function file)

### -port
(Specify the exposed port)

## rpc (rpc service related operations)

### new
(Quickly generate an rpc service)

- -idea
  (Identifies whether the command comes from the idea plug-in and is used for the development and use of the idea plug-in. Please ignore the terminal execution [optional])
- -style
  (Specify the file name naming style, `gozero`: lowercase, `go_zero`: underscore, `GoZero`: camel case)

### template
(Create a proto template file)

- -idea
  (Identifies whether the command comes from the idea plug-in and is used for the development and use of the idea plug-in. Please ignore the terminal execution [optional])
- -out,o
  (Specify the code storage directory)

### proto
(Generate rpc service based on proto)

- -src,s
  (Specify the proto file source)
- -proto_path,I
  (Specify proto import to find the directory, protoc native commands, for specific usage, please refer to protoc -h to view)
- -dir,d
  (Specify the code storage directory)
- -idea
  (Identifies whether the command comes from the idea plug-in and is used for the development and use of the idea plug-in. Please ignore the terminal execution [optional])
- -style
  (Specify the file name naming style, `gozero`: lowercase, `go_zero`: underscore, `GoZero`: camel case)

### model
(Model layer code operation)

- mysql
  (Generate model code from mysql)

    - ddl
      (Specify the data source to generate model code for the ddl file)

        - -src,s
          (Specify the source of the sql file containing ddl, support wildcard matching)
        - -dir,d
          (Specify the code storage directory)
        - -style
          (Specify the file name naming style, `gozero`: lowercase, `go_zero`: underscore, `GoZero`: camel case)
        - -cache,c
          (Whether the generated code has redis cache logic, bool value)
        - -idea
          (Identifies whether the command comes from the idea plug-in and is used for the development and use of the idea plug-in. Please ignore the terminal execution [optional])

    - datasource
      (Specify the data source to generate model code from the datasource)

        - -url
          (Specify datasource)
        - -table,t
          (Specify the table name, support wildcards)
        - -dir,d
          (Specify the code storage directory)
        - -style
          (Specify the file name naming style, `gozero`: lowercase, `go_zero`: underscore, `GoZero`: camel case)
        - -cache,c
          (Whether the generated code has redis cache logic, bool value)
        - -idea
          (Identifies whether the command comes from the idea plug-in and is used for the development and use of the idea plug-in. Please ignore the terminal execution [optional])
- mongo
  (generate model code from mongo)

  -type,t
  (specify Go Type name)
  -cache,c
  (generate code with redis cache logic or not, bool value, default no)
  -dir,d
  (specify the code generation directory)
  -style
  (specify filename naming style, gozero:lowercase, go_zero:underscore, GoZero:hump)
      
## upgrade
Goctl updated to the latest version

## kube
Generate k8s deployment file

### deploy


- -name
  service name
- -namespace
  k8s namespace
- -image
  docker image
- -secret
  Specify the k8s secret to obtain the mirror
- -requestCpu
  Specify the default allocation of cpu
- -requestMem
  Specify the default allocation of memory
- -limitCpu
  Specify the maximum allocation of cpu
- -limitMem
  Specify the maximum amount of memory allocated
- -o
  `deployment.yaml` output directory
- -replicas
  Specify the replicas
- -revisions
  Specify the number of release records to keep
- -port
  Specify service port
- -nodePort
  Specify the service's external exposure port
- -minReplicas
  Specify the minimum number of copies
- -maxReplicas
  Specify the maximum number of copies


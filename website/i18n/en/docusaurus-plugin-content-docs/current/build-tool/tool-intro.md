---
sidebar_position: 1
---

# Introduction

`goctl` is pronounced as `go control`, not as `go C-T-L`. `goctl` means not to be controlled by the code, but to control it. Where `go` does not mean `golang`. When I designed `goctl`, I wanted to use her to free our hands 👈

### api generation

| Name | Function | Example |
| --- | --- | --- |
| `-o` | generate api file | `goctl api -o user.api` |
| `new` | Quickly create an api service | `goctl api new user` |
| `format` | api formatting，`vscode`Using <br /> `-dir`Target Catalog <br /> `-iu`Whether to automatically update goctl <br /> `-stdin`Whether to read data from standard input |  |
| `validate` | Verify that the api file is valid <br/> `-api` Specify api file source | `goctl api validate -api user.api` |
| `doc` | generate doc markdown <br/> `-dir` specify directory | `goctl api doc -dir user` |
| `go` | Generate golang api service<br/>`-dir`Specify the generated code directory<br/>`-api`Specify api file source<br/>`-force`Whether to force an overwrite of an existing file<br/>`style`Specify filename naming style，gozero: Lowercase，go_zero: Underline,GoZero: humps |  |
| `java` | Generate code to access api service - java language<br/> `-dir` specify code storage directory<br/> `-api` specify api file source | |
| `ts` | Generate code to access api service - ts language<br/>`-dir`Specify the code storage directory<br/>`-api`Specify api file source<br/>`webapi`<br/>`caller`<br/>`unwrap` |  |
| `dart` | generate access to api service code-dart language<br/> `-dir` specify code storage directory<br/> `-api` specify api file source | |
| `kt` | Generate code to access api services - kotlin language<br/>`-dir`Specify the code storage directory<br/>`-api`Specify api file source<br/>`pkg`Specify package name |  |
| `plugin` | `-plugin`Executable files<br/>`-dir`Code storage target folder<br/>`-api`api source code file<br/>`-style`File name naming formatting |  |

### rpc generation

| Name | Function | Example |
| --- | --- | --- |
| `new` | Quickly generate an rpc service<br/>`-idea` identifies whether the command comes from the idea plugin, for idea plugin development use, terminal execution please ignore [optional parameter]<br/>`-style` specifies the filename naming style, gozero:lowercase,go_zero:underscore,GoZero:hump | |
| `template` | create a proto template file<br/>`-idea` identifies whether the command comes from the idea plugin, for use in idea plugin development, ignore [optional parameter]<br/>`-out,o` specifies the code storage directory | |
| `proto` | Generate rpc services based on proto<br/>`-src,s`Specify the proto file source<br/>`-proto_path,I`Specify the proto import lookup directory, protoc native command, please refer to protoc -h to see the specific usage<br/>`-dir,d`Specify the code storage directory<br/>`-idea`Identifies whether the command comes from the idea plugin, for idea plugin development use, terminal execution please ignore [optional parameter]<br/>`-style`Specify filename naming style, gozero:lowercase,go_zero:underscore,GoZero:hump |  |
| `model` | Model layer code operation<br/><br/>`mysql` generates model code from mysql<br/>&emsp;&emsp;`ddl` specifies data source to generate model code for ddl file<br/>&emsp;&emsp;&emsp;&emsp;`-src,s` specifies the sql file source containing ddl, supports wildcard matching<br/>&emsp;&emsp;&emsp;&emsp;`-dir,d` specifies the code storage directory<br/> &emsp;&emsp;&emsp;&emsp;`-style` specifies the file name naming style, gozero: lowercase, go_zero: underscore, GoZero: camel<br/>&emsp;&emsp;&emsp;&emsp;`-cache,c` whether to generate code With redis cache logic, bool value<br/>&emsp;&emsp;&emsp;&emsp;`-idea` identifies whether the command comes from the idea plug-in and is used for idea plug-in development. Please ignore the terminal execution [optional parameter]<br/ >&emsp;&emsp;`datasource`Specify data source to generate model code from database link<br/>&emsp;&emsp;&emsp;&emsp;`-url`Specify database link<br/>&emsp;&emsp;&emsp;&emsp;`- table,t` specifies the table name, supports wildcards<br/>&emsp;&emsp;&emsp;&emsp;`-dir,d` specifies the code storage directory<br/>&emsp;&emsp;&emsp;&emsp;`-style` specifies the file Name naming style, gozero: lowercase, go_zero: underscore, GoZero: camel case<br/>&emsp;&emsp;&emsp;&emsp;`-cache,c` whether the generated code has redis cache logic, bool value<br/>&emsp;&emsp;&emsp;&emsp;`-idea` identifies whether the command comes from the idea plug-in and is used for the development and use of the idea plug-in. Please ignore the [optional parameter] for terminal execution.<br/><br/>`mongo` generates model code from mongo< br/>&emsp;&emsp;`-type,t` specifies the name of Go Type<br/>&emsp;&emsp;`-cache,c` whether the generated code has redis cache logic, bool value, default no<br/>&emsp; &emsp;`-dir,d` specifies the code generation directory<br/>&emsp;&emsp;`-style` refers to Specify the file name naming style, gozero: lowercase, go_zero: underscore, GoZero: camel case | |

### model generation
| Name | Function | Example |
| --- | --- | --- |
| `mysql` | Generate model code from mysql<br/>&emsp;&emsp;`ddl` Specify data source to generate model code for ddl file<br/>&emsp;&emsp;&emsp;&emsp;`-src,s` Specify include The sql file source of ddl supports wildcard matching<br/>&emsp;&emsp;&emsp;&emsp;`-dir,d` specifies the code storage directory<br/>&emsp;&emsp;&emsp;&emsp;`-style` specifies the file name Naming style, gozero: lowercase, go_zero: underscore, GoZero: camel case<br/>&emsp;&emsp;&emsp;&emsp;`-cache,c` whether the generated code has redis cache logic, bool value<br/>&emsp;&emsp; &emsp;&emsp;`-idea` identifies whether the command comes from the idea plug-in and is used for the development and use of the idea plug-in, please ignore the terminal execution [optional parameter]<br/>&emsp;&emsp;`datasource` specifies that the data source is generated from the database link model code<br/>&emsp;&emsp;&emsp;&emsp;`-url` specifies the database link<br/>&emsp;&emsp;&emsp;&emsp;`-table,t` specifies the table name, supports wildcards<br/>&emsp ;&emsp;&emsp;&emsp;`-dir,d` specifies the code storage directory<br/>&emsp;&emsp;&emsp;&emsp;`-style` specifies the file name naming style, gozero: lowercase, go_zero: underscore, GoZero: camel case <br/>&emsp;&emsp;&emsp;&emsp;`-cache,c` whether the generated code has redis cache logic, bool value<br/>&emsp;&emsp;&emsp;&emsp;`-idea` identifies whether the command comes from idea Plug-in, used for the development and use of idea plug-in, please ignore the terminal execution [optional parameter] | |
| `mongo` | Generate model code from mongo<br/>&emsp;&emsp;`-type,t` Specify Go Type name<br/>&emsp;&emsp;`-cache,c` Whether the generated code has redis cache logic, bool value, default no<br/>&emsp;&emsp;`-dir,d` specifies the code generation directory<br/>&emsp;&emsp;`-style` specifies the file name naming style, gozero: lowercase, go_zero: underscore, GoZero :Hump| |

### template operation
| Name | Function | Example |
| --- | --- | --- |
| `init` | Save `api`/`rpc`/`model` template | `goctl template init` |
| `clean` | clear cache template | `goctl template clean` |
| `update` | update template<br/>`-category,c` specify the group name to be updated `api`/`rpc`/`model` | `goctl template update -c api` |
| `revert` | restore the specified template file<br/>`-category,c` specify the name of the group to be updated `api`/`rpc`/`model`<br/>`-name,n` specify the name of the template file | |

### config configuration file generation
| Name | Function | Example |
| --- | --- | --- |
| `-path,p` | specify the configuration file directory | `goctl config -p user` |

### docker generates Dockerfile
| Name | Function | Example |
| --- | --- | --- |
| `-go` | specify main function file | |
| `-port` | Specify the exposed port | |

### upgrade goctl to update to the latest version

### kube Generate k8s deployment files

### deploy k8s deploymenet
| Name | Function | Example |
| --- | --- | --- |
| `-name` | service name | |
| `-namespace` | specify k8s namespace | |
| `-image` | specify the image name | |
| `-secret` | Specifies the k8s secret for getting the image | |
| `-requestCpu` | specify the default cpu allocation | |
| `-requestMem` | specify the default memory allocation | |
| `-limitCpu` | specify the maximum cpu allocation | |
| `-limitMem` | specify the maximum memory allocation | |
| `-o` | deployment.yaml output directory | |
| `-replicas` | specify the number of replicas | |
| `-revisions` | specify the number of records to keep for the release | |
| `-port` | specify the service port | |
| `-nodePort` | specifies the port to which the service is exposed | |
| `-minReplicas` | specify the minimum number of replicas | |
| `-maxReplicas` | specify the maximum number of replicas | |



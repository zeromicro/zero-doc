---
sidebar_position: 1
---

# goctl介绍

`goctl` 读作 `go control`，不要读成 `go C-T-L`。`goctl` 的意思是不要被代码控制，而是要去控制它。其中的 `go` 不是指 `golang`。在设计 `goctl` 之初，我就希望通过 她 来解放我们的双手👈

### api 生成
| 名称 | 功能 | 示例 |
| --- | --- | --- |
| `-o` | 生成api文件 | `goctl api -o user.api` |
| `new` | 快速创建一个api服务 | `goctl api new user` |
| `format` | api格式化，`vscode`使用 <br /> `-dir`目标目录 <br /> `-iu`是否自动更新goctl <br /> `-stdin`是否从标准输入读取数据 |  |
| `validate` | 验证api文件是否有效 <br/> `-api` 指定api文件源 | `goctl api validate -api user.api` |
| `doc` | 生成doc markdown <br/> `-dir`指定目录 | `goctl api doc -dir user` |
| `go` | 生成golang api服务<br/>`-dir`指定生成代码目录<br/>`-api`指定api文件源<br/>`-force`是否强制覆盖已存在的文件<br/>`style`指定文件名命名风格，gozero: 小写，go_zero: 下划线,GoZero: 驼峰 |  |
| `java` | 生成访问api服务代码-java语言<br/>`-dir`指定代码存放目录<br/>`-api`指定api文件源 |  |
| `ts` | 生成访问api服务代码-ts语言<br/>`-dir`指定代码存放目录<br/>`-api`指定api文件源<br/>`webapi`<br/>`caller`<br/>`unwrap` |  |
| `dart` | 生成访问api服务代码-dart语言<br/>`-dir`指定代码存放目录<br/>`-api`指定api文件源 |  |
| `kt` | 生成访问api服务代码-kotlin语言<br/>`-dir`指定代码存放目录<br/>`-api`指定api文件源<br/>`pkg`指定包名 |  |
| `plugin` | `-plugin`可执行文件<br/>`-dir`代码存放目标文件夹<br/>`-api`api源码文件<br/>`-style`文件名命名格式化 |  |

### rpc 生成
| 名称 | 功能 | 示例 |
| --- | --- | --- |
| `new` | 快速生成一个rpc服务<br/>`-idea`标识命令是否来源于idea插件，用于idea插件开发使用，终端执行请忽略[可选参数]<br/>`-style`指定文件名命名风格，gozero:小写，go_zero:下划线,GoZero:驼峰 |  |
| `template` | 创建一个proto模板文件<br/>`-idea`标识命令是否来源于idea插件，用于idea插件开发使用，终端执行请忽略[可选参数]<br/>`-out,o`指定代码存放目录 |  |
| `proto` | 根据proto生成rpc服务<br/>`-src,s`指定proto文件源<br/>`-proto_path,I`指定proto import查找目录，protoc原生命令，具体用法可参考protoc -h查看<br/>`-dir,d`指定代码存放目录<br/>`-idea`标识命令是否来源于idea插件，用于idea插件开发使用，终端执行请忽略[可选参数]<br/>`-style`指定文件名命名风格，gozero:小写，go_zero:下划线,GoZero:驼峰 |  |
| `model` | model层代码操作<br/><br/>`mysql`从mysql生成model代码<br/>&emsp;&emsp;`ddl`指定数据源为ddl文件生成model代码<br/>&emsp;&emsp;&emsp;&emsp;`-src,s`指定包含ddl的sql文件源，支持通配符匹配<br/>&emsp;&emsp;&emsp;&emsp;`-dir,d`指定代码存放目录<br/>&emsp;&emsp;&emsp;&emsp;`-style`指定文件名命名风格，gozero:小写，go_zero:下划线,GoZero:驼峰<br/>&emsp;&emsp;&emsp;&emsp;`-cache,c`生成代码是否带redis缓存逻辑，bool值<br/>&emsp;&emsp;&emsp;&emsp;`-idea`标识命令是否来源于idea插件，用于idea插件开发使用，终端执行请忽略[可选参数]<br/>&emsp;&emsp;`datasource`指定数据源从数据库链接生成model代码<br/>&emsp;&emsp;&emsp;&emsp;`-url`指定数据库链接<br/>&emsp;&emsp;&emsp;&emsp;`-table,t`指定表名，支持通配符<br/>&emsp;&emsp;&emsp;&emsp;`-dir,d`指定代码存放目录<br/>&emsp;&emsp;&emsp;&emsp;`-style`指定文件名命名风格，gozero:小写，go_zero:下划线,GoZero:驼峰<br/>&emsp;&emsp;&emsp;&emsp;`-cache,c`生成代码是否带redis缓存逻辑，bool值<br/>&emsp;&emsp;&emsp;&emsp;`-idea`标识命令是否来源于idea插件，用于idea插件开发使用，终端执行请忽略[可选参数]<br/><br/>`mongo`从mongo生成model代码<br/>&emsp;&emsp;`-type,t`指定Go Type名称<br/>&emsp;&emsp;`-cache,c`生成代码是否带redis缓存逻辑，bool值，默认否<br/>&emsp;&emsp;`-dir,d`指定代码生成目录<br/>&emsp;&emsp;`-style`指定文件名命名风格，gozero:小写，go_zero:下划线,GoZero:驼峰 |  |

### model 生成
| 名称 | 功能 | 示例 |
| --- | --- | --- |
| `mysql` | 从mysql生成model代码<br/>&emsp;&emsp;`ddl`指定数据源为ddl文件生成model代码<br/>&emsp;&emsp;&emsp;&emsp;`-src,s`指定包含ddl的sql文件源，支持通配符匹配<br/>&emsp;&emsp;&emsp;&emsp;`-dir,d`指定代码存放目录<br/>&emsp;&emsp;&emsp;&emsp;`-style`指定文件名命名风格，gozero:小写，go_zero:下划线,GoZero:驼峰<br/>&emsp;&emsp;&emsp;&emsp;`-cache,c`生成代码是否带redis缓存逻辑，bool值<br/>&emsp;&emsp;&emsp;&emsp;`-idea`标识命令是否来源于idea插件，用于idea插件开发使用，终端执行请忽略[可选参数]<br/>&emsp;&emsp;`datasource`指定数据源从数据库链接生成model代码<br/>&emsp;&emsp;&emsp;&emsp;`-url`指定数据库链接<br/>&emsp;&emsp;&emsp;&emsp;`-table,t`指定表名，支持通配符<br/>&emsp;&emsp;&emsp;&emsp;`-dir,d`指定代码存放目录<br/>&emsp;&emsp;&emsp;&emsp;`-style`指定文件名命名风格，gozero:小写，go_zero:下划线,GoZero:驼峰<br/>&emsp;&emsp;&emsp;&emsp;`-cache,c`生成代码是否带redis缓存逻辑，bool值<br/>&emsp;&emsp;&emsp;&emsp;`-idea`标识命令是否来源于idea插件，用于idea插件开发使用，终端执行请忽略[可选参数]  |  |
| `mongo` | 从mongo生成model代码<br/>&emsp;&emsp;`-type,t`指定Go Type名称<br/>&emsp;&emsp;`-cache,c`生成代码是否带redis缓存逻辑，bool值，默认否<br/>&emsp;&emsp;`-dir,d`指定代码生成目录<br/>&emsp;&emsp;`-style`指定文件名命名风格，gozero:小写，go_zero:下划线,GoZero:驼峰 |  |

### template 模板操作
| 名称 | 功能 | 示例 |
| --- | --- | --- |
| `init` | 存`api`/`rpc`/`model`模板 | `goctl template init` |
| `clean` | 清空缓存模板 | `goctl template clean` |
| `update` | 更新模板<br/>`-category,c`指定需要更新的分组名 `api`/`rpc`/`model` | `goctl template update -c api` |
| `revert` | 还原指定模板文件<br/>`-category,c`指定需要更新的分组名 `api`/`rpc`/`model`<br/>`-name,n`指定模板文件名 |  |

### config 配置文件生成
| 名称 | 功能 | 示例 |
| --- | --- | --- |
| `-path,p` | 指定配置文件存放目录 | `goctl config -p user` |

### docker 生成Dockerfile
| 名称 | 功能 | 示例 |
| --- | --- | --- |
| `-go` | 指定main函数文件 |  |
| `-port` | 指定暴露端口 |  |

### upgrade goctl更新到最新版本

### kube 生成k8s部署文件

### deploy k8s deploymenet
| 名称 | 功能 | 示例 |
| --- | --- | --- |
| `-name` | 服务名称 |  |
| `-namespace` | 指定k8s namespace |  |
| `-image` | 指定镜像名称 |  |
| `-secret` | 指定获取镜像的k8s secret |  |
| `-requestCpu` | 指定cpu默认分配额 |  |
| `-requestMem` | 指定内存默认分配额 |  |
| `-limitCpu` | 指定cpu最大分配额 |  |
| `-limitMem` | 指定内存最大分配额 |  |
| `-o` | deployment.yaml输出目录 |  |
| `-replicas` | 指定副本数 |  |
| `-revisions` | 指定保留发布记录数 |  |
| `-port` | 指定服务端口 |  |
| `-nodePort` | 指定服务对外暴露端口 |  |
| `-minReplicas` | 指定最小副本数 |  |
| `-maxReplicas` | 指定最大副本数 |  |
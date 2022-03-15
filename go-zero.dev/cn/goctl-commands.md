# goctl命令大全
![goctl](./resource/goctl-cn.svg)

# goctl

## bug
（报告一个错误）

## upgrade
（将goctl升级到最新版本）

## env
（检查或编辑goctl环境）

### --write, -w: 编辑goctl环境

### check
（检测goctl环境和依赖性工具）

- --force, -f: 默许安装不存在的依赖项
- --install, -i: 如果没有找到，就安装依赖工具

## migrate
（从tal-tech迁移到zeromicro）

### --verbose, -v: verbose可以实现额外的日志记录

### --version: 要迁移的github.com/zeromicro/go-zero的目标版本。

## api
（生成api相关文件）

### --branch：远程版本库的分支，它与--remote一起工作。

### --home：模板的goctl首页路径，--home和--remote不能同时设置，如果它们同时设置，--remote的优先级更高

### --remote：模板的远程git repo，--home和--remote不能同时设置，如果同时设置，--remote的优先级更高

git repo目录必须与https://github.com/zeromicro/go-zero-template 目录结构一致<br>
### -o：输出api文件

### new
（快速创建api服务）

- --branch：远程repo的分支，它与--remote一起工作。
- --home: 模板的goctl首页路径，--home和--remote不能同时设置，如果设置了，--remote的优先级更高
- --remote：模板的远程git repo，--home和--remote不能同时设置，如果同时设置，--remote的优先级更高
  git repo目录必须与https://github.com/zeromicro/go-zero-template 目录结构一致
- --style：文件的命名格式，见[https://github.com/zeromicro/go-zero/blob/master/tools/goctl/config/readme.md]

### format
（格式化api文件）

- --declare：用于跳过检查已经声明的api类型
- --dir: 格式目标目录
- --iu: 忽略更新
- --stdin：使用stdin输入api文件内容，按 "ctrl + d "发送EOF。

### validate
（验证api文件）

- --api: 验证目标api文件

### doc
（生成文档文件）

- --dir: 目标目录
- --o: 输出markdown目录

### go
（提供的api生成go文件）

- --api: api文件
- --branch: 远程 repo 的分支，它与 --remote 一起工作。
- --dir: 目标目录
- --home: 模板的goctl首页路径，--home和--remote不能同时设置，如果它们同时设置，--remote的优先级更高
- --remote：模板的远程git repo，--home和--remote不能同时设置，如果同时设置，--remote的优先级更高
  git repo目录必须与https://github.com/zeromicro/go-zero-template 目录结构一致
- --style：文件的命名格式，见[https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]

### java
（为api文件中提供的api生成java文件）

- --api: api文件
- --dir: 目标目录

### ts
（为api文件中提供的api生成ts文件）

- --api: api文件
- --caller: 网络api调用者
- --dir: 目标目录
- --unwrap: 解除webapi调用器的包装，以便导入
- --webapi: web api文件的路径

### dart
（为api文件中提供的api生成dart文件）

- --api: api文件
- --dir: 目标目录
- --hostname: 服务器的主机名
- --legacy: 用于flutter v1的传统生成器

### kt
（为提供的api文件生成kotlin代码）

- --api: api文件
- --dir: 目标目录
- --pkg: 定义kotlin文件的包名

### plugin
（自定义文件生成器）

- --api: api文件
- --dir: 目标目录
- --plugin, -p: 插件文件
- --style: 文件的命名格式，见[https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]

## docker
（生成Docker文件）

### --branch：远程版本库的分支，它与--remote一起工作。

### --go：包含主函数的文件

### --home：模板的goctl首页路径，--home和--remote不能同时设置，如果它们同时设置，--remote的优先级更高

### --port：要公开的端口，默认为无（默认：0）。

### --remote：模板的远程git repo，--home和--remote不能同时设置，如果它们同时设置，--remote的优先级更高。

git repo目录必须与https://github.com/zeromicro/go-zero-template 目录结构一致<br>
### --scratch：使用scratch作为基础docker镜像

### --tz：容器的时区（默认：亚洲/上海）

### --version：goctl builder golang镜像的版本。

## kube
（生成kubernetes文件）

### deploy
（生成部署yaml文件）

- --branch：远程repo的分支，它与--remote一起工作。
- --home：模板的goctl首页路径，--home和--remote不能同时设置，如果设置了，--remote的优先级更高
- --image：部署的docker镜像
- --limitCpu：部署的cpu上限（默认为1000）。
- --limitMem: 部署的内存上限（默认为1024）。
- --maxReplicas: 部署的最大复制数（默认为10）。
- --minReplicas: 部署的最小复制量（默认为3）。
- --name：部署的名称
- --namespace：部署的命名空间
- --nodePort: 要公开的部署的nodePort（默认为0）。
- --port: 要在pod上监听的部署的端口（默认值：0）
- --remote：模板的远程git repo，--home和--remote不能同时设置，如果它们同时设置，--remote有更高的优先级。
  git repo目录必须与https://github.com/zeromicro/go-zero-template 目录结构一致
- --replicas：要部署的副本数量（默认：3个）。
- --requestCpu：要部署的请求cpu（默认为500）。
- --requestMem: 要部署的请求内存（默认为512）。
- --revisions: 限制修订历史的数量（默认为5）。
- --secret: 从注册表中提取镜像的秘密。
- --serviceAccount：部署的ServiceAccount。
- -o: 输出的yaml文件

## rpc
（生成rpc代码）

### new
（生成rpc演示服务）

- --branch: 远程版本库的分支，它与--remote一起工作。
- --home：模板的goctl首页路径，--home和--remote不能同时设置，如果同时设置，--remote的优先级更高
- --idea：命令执行环境是否来自idea插件。[可选]
- --remote：模板的远程git repo，--home和--remote不能同时设置，如果同时设置，--remote的优先级更高
  git repo目录必须与https://github.com/zeromicro/go-zero-template 目录结构一致
- --style：文件的命名格式，见[https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]

### template
（生成proto模板）

- --branch：远程repo的分支，它与--remote一起工作。
- --home：模板的goctl主路径，--home和--remote不能同时设置，如果设置了，--remote的优先级更高
- --out, -o: proto的目标路径
- --remote：模板的远程git repo，--home和--remote不能同时设置，如果有的话，--remote的优先级更高
  git repo目录必须与https://github.com/zeromicro/go-zero-template 目录结构一致

### protoc
（生成grpc代码）

- --branch：远程repo的分支，它与--remote一起工作。
- --home: 模板的goctl主路径
- --remote: 模板的远程git repo，--home和--remote不能同时设置，如果它们同时设置，--remote的优先级更高。
  git repo目录必须与https://github.com/zeromicro/go-zero-template 目录结构一致
- --style：文件的命名格式，见[https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]
- --zrpc_out：zrpc的输出目录

## model
（生成model代码）

### mysql
（生成mysql模型）

- ddl
  （从ddl生成mysql模型）


	- --branch：远程 repo 的分支，它与 --remote 一起工作。
	- --cache, -c：生成带有缓存的代码[可选] 。
	- --database, --db：数据库的名称 [可选]
	- --dir, -d: 目标目录
	- --home：模板的goctl首页路径，--home和--remote不能同时设置，如果设置了，--remote的优先级更高
	- --idea：用于理念插件[可选]
	- --remote：模板的远程git repo，--home和--remote不能同时设置，如果同时设置，--remote的优先级更高
git repo目录必须与https://github.com/zeromicro/go-zero-template 目录结构一致
- --src, -s：ddl的路径或路径globbing模式
- --style：文件的命名格式，见[https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]

- datasource
  （从数据源生成模型）


	- --branch：远程 repo 的分支，它与 --remote 一起工作。
	- --cache, -c: 使用缓存生成代码 [可选]
	- --dir, -d：目标目录
	- --home：模板的goctl首页路径，--home和--remote不能同时设置，如果它们同时设置，--remote的优先级更高
	- --idea：用于理念插件[可选]
	- --remote：模板的远程git repo，--home和--remote不能同时设置，如果同时设置，--remote的优先级更高
git repo目录必须与https://github.com/zeromicro/go-zero-template 目录结构一致
- --style：文件的命名格式，见[https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]
    - --table, -t：数据库中的表或表球化模式
- --url：数据库的数据源，如 "root:password@tcp(127.0.0.1:3306)/database"

### pg
（生成postgresql模型）

- datasource
  （从数据源生成模型）


	- --branch：远程 repo 的分支，它与 --remote 一起工作。
	- --cache, -c：生成带有缓存的代码[可选] 。
	- --dir, -d：目标目录
	- --home：模板的goctl首页路径，--home和--remote不能同时设置，如果它们同时设置，--remote的优先级更高
	- --idea：用于理念插件[可选]
	- --remote：模板的远程git repo，--home和--remote不能同时设置，如果同时设置，--remote的优先级更高
git repo目录必须与https://github.com/zeromicro/go-zero-template 目录结构一致
- --schema, -s：表的模式，默认为[public]
- --style：文件的命名格式，见[https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]
    - --table, -t: 数据库中的表或表球化模式
- --url：数据库的数据源，如 "postgres://root:password@127.0.0.1:5432/database?sslmode=disable"

### mongo
（生成mongo模型）


- --branch：远程repo的分支，它与--remote一起工作。
- --cache, -c: 使用缓存生成代码 [可选]
- --dir, -d：目标目录
- --home：模板的goctl首页路径，--home和--remote不能同时设置，如果它们同时设置，--remote的优先级更高
- --remote：模板的远程git repo，--home和--remote不能同时设置，如果同时设置，--remote的优先级更高
  git repo目录必须与https://github.com/zeromicro/go-zero-template 目录结构一致
- --style：文件的命名格式，见[https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]
- --type, -t：指定的模型类型名称

## template
（模板操作）

### init
（初始化所有模板(强制更新)）

- --home: 模板的goctl主路径

### clean
（清理所有缓存的模板）

- --home: 模板的goctl主路径

### update
（将目标类别的模板更新为最新的）

- --category, -c: 模板的类别，枚举[api,rpc,model,docker,kube]
- --home: 模板的goctl主页路径

### revert
（将目标模板恢复到最新版本）

- --category, -c: 模板的类别，枚举[api,rpc,model,docker,kube] 。
- --home：模板的goctl主路径
- --name, -n: 模板的目标文件名

## completion
（生成自动补全脚本，它只适用于类unix操作系统）

### --name, -n：自动完成脚本的文件名，默认为[goctl_autocomplete]




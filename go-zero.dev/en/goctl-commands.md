# goctl command list
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)


![goctl](./resource/goctl-command-en.svg)

# goctl

## bug
(report a bug)

## upgrade
(upgrade goctl to latest version)

## env
(check or edit goctl environment)

### --write, -w: edit goctl environment

### check
(detect goctl env and dependency tools)

- --force, -f: silent installation of non-existent dependencies
- --install, -i: install dependencies if not found

## migrate
(migrate from tal-tech to zeromicro)

### --verbose, -v: verbose enables extra logging

### --version: the target release version of github.com/zeromicro/go-zero to migrate

## api
（generate api related files）

### --branch: the branch of the remote repo, it does work with --remote

### --home: the goctl home path of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority

### --remote: the remote git repo of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
The git repo directory must be consistent with the https://github.com/zeromicro/go-zero-template directory structure

### -o: the output api file

### new
(fast create api service)

- --branch: the branch of the remote repo, it does work with --remote
- --home: the goctl home path of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
- --remote: the remote git repo of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
  The git repo directory must be consistent with the https://github.com/zeromicro/go-zero-template directory structure
- --style: the file naming format, see [https://github.com/zeromicro/go-zero/blob/master/tools/goctl/config/readme.md]

### format
(format api files)

- --declare: use to skip check api types already declare
- --dir: the format target dir
- --iu: ignore update
- --stdin: use stdin to input api doc content, press "ctrl + d" to send EOF

### validate
(validate api file)

- --api: validate target api file

### doc
(generate doc files)

- --dir: the target dir
- -o: the output markdown directory

### go
(generate go files for provided api in yaml file)

- --api: the api file
- --branch: the branch of the remote repo, it does work with --remote
- --dir: the target dir
- --home: the goctl home path of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
- --remote: the remote git repo of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
  The git repo directory must be consistent with the https://github.com/zeromicro/go-zero-template directory structure
- --style: the file naming format, see [https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]

### java
(generate java files for provided api in api file)

- --api: the api file
- --dir: the target dir

### ts
(generate ts files for provided api in api file)

- --api: the api file
- --caller: the web api caller
- --dir: the target dir
- --unwrap: unwrap the webapi caller for import
- --webapi: the web api file path

### dart
(generate dart files for provided api in api file)

- --api: the api file
- --dir: the target dir
- --hostname: hostname of the server
- --legacy: legacy generator for flutter v1

### kt
(generate kotlin code for provided api file)

- --api: the api file
- --dir: the target directory
- --pkg: define package name for kotlin file

### plugin
(custom file generator)

- --api: the api file
- --dir: the target directory
- --plugin, -p: the plugin file
- --style: the file naming format, see [https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]

## docker
(generate Dockerfile)

### --branch: the branch of the remote repo, it does work with --remote

### --go: the file that contains main function

### --home: the goctl home path of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority

### --port: the port to expose, default none (default: 0)

### --remote: the remote git repo of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
The git repo directory must be consistent with the https://github.com/zeromicro/go-zero-template directory structure

### --scratch: use scratch for the base docker image

### --tz: the timezone of the container (default: Asia/Shanghai)

### --version: the goctl builder golang image version

## kube
(generate kubernetes files)

### deploy
(generate deployment yaml file)

- --branch: the branch of the remote repo, it does work with --remote
- --home: the goctl home path of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
- --image: the docker image of deployment
- --limitCpu: the limit cpu to deploy (default: 1000)
- --limitMem: the limit memory to deploy (default: 1024)
- --maxReplicas: the max replicas of deploy (default: 10)
- --minReplicas: the min replicas to deploy (default: 3)
- --name: the name of deployment
- --namespace: the namespace of deployment
- --nodePort: the nodePort of the deployment to expose (default: 0)
- --port: the port of the deployment to listen on pod (default: 0)
- --remote: the remote git repo of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
  The git repo directory must be consistent with the https://github.com/zeromicro/go-zero-template directory structure
- --replicas: the number of replicas to deploy (default: 3)
- --requestCpu: the request cpu to deploy (default: 500)
- --requestMem: the request memory to deploy (default: 512)
- --revisions: the number of revision history to limit (default: 5)
- --secret: the secret to image pull from registry
- --serviceAccount: the ServiceAccount for the deployment
- -o: the output yaml file

## rpc
(generate rpc code)

### new
(generate rpc demo service)

- --branch: the branch of the remote repo, it does work with --remote
- --home: the goctl home path of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
- --idea: whether the command execution environment is from idea plugin. [optional]
- --remote: the remote git repo of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
  The git repo directory must be consistent with the https://github.com/zeromicro/go-zero-template directory structure
- --style: the file naming format, see [https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]

### template
(generate proto template)

- --branch: the branch of the remote repo, it does work with --remote
- --home: the goctl home path of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
- --out, -o: the target path of proto
- --remote: the remote git repo of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
  The git repo directory must be consistent with the https://github.com/zeromicro/go-zero-template directory structure

### protoc
(generate grpc code)

- --branch: the branch of the remote repo, it does work with --remote
- --home: the goctl home path of the template
- --remote: the remote git repo of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
  The git repo directory must be consistent with the https://github.com/zeromicro/go-zero-template directory structure
- --style: the file naming format, see [https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]
- --zrpc_out: the zrpc output directory

### proto
(generate rpc from proto)

- --branch: the branch of the remote repo, it does work with --remote
- --dir, -d: the target path of the code
- --go_opt: native command of protoc-gen-go, specify the mapping from proto to go, eg --go_opt=proto_import=go_package_import. [optional]
- --home: the goctl home path of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
- --idea: whether the command execution environment is from idea plugin. [optional]
- --proto_path, -I: native command of protoc, specify the directory in which to search for imports. [optional]
- --remote: the remote git repo of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
  The git repo directory must be consistent with the https://github.com/zeromicro/go-zero-template directory structure
- --src, -s: the file path of the proto source file
- --style: the file naming format, see [https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]

## model
（generate model code）

### mysql
（generate mysql model）

- ddl
  （generate mysql model from ddl）

    - --branch: the branch of the remote repo, it does work with --remote
    - --cache, -c: generate code with cache [optional]
    - --database, --db: the name of database [optional]
    - --dir, -d: the target dir
    - --home: the goctl home path of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
    - --idea: for idea plugin [optional]
    - --remote: the remote git repo of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
      The git repo directory must be consistent with the https://github.com/zeromicro/go-zero-template directory structure
    - --src, -s: the path or path globbing patterns of the ddl
    - --style: the file naming format, see [https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]

- datasource
  （generate model from datasource）

    - --branch: the branch of the remote repo, it does work with --remote
    - --cache, -c: generate code with cache [optional]
    - --dir, -d: the target dir
    - --home: the goctl home path of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
    - --idea: for idea plugin [optional]
    - --remote: the remote git repo of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
      The git repo directory must be consistent with the https://github.com/zeromicro/go-zero-template directory structure
    - --style: the file naming format, see [https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]
    - --table, -t: the table or table globbing patterns in the database
    - --url: the data source of database,like "root:password@tcp(127.0.0.1:3306)/database"

### pg
(generate postgresql model)

- datasource
  （generate model from datasource）

    - --branch: the branch of the remote repo, it does work with --remote
    - --cache, -c: generate code with cache [optional]
    - --dir, -d: the target dir
    - --home: the goctl home path of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
    - --idea: for idea plugin [optional]
    - --remote: the remote git repo of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
      The git repo directory must be consistent with the https://github.com/zeromicro/go-zero-template directory structure
    - --schema, -s: the table schema, default is [public]
    - --style: the file naming format, see [https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]
    - --table, -t: the table or table globbing patterns in the database
    - --url: the data source of database,like "postgres://root:password@127.0.0.1:5432/database?sslmode=disable"

### mongo
(generate mongo model)

- --branch: the branch of the remote repo, it does work with --remote
- --cache, -c: generate code with cache [optional]
- --dir, -d: the target dir
- --home: the goctl home path of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
- --remote: the remote git repo of the template, --home and --remote cannot be set at the same time, if they are, --remote has higher priority
  The git repo directory must be consistent with the https://github.com/zeromicro/go-zero-template directory structure
- --style: the file naming format, see [https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]
- --type, -t: specified model type name

## template
（template operation）

### init
（initialize the all templates(force update)）

- --home: the goctl home path of the template

### clean
（clean the all cache templates）

- --home: the goctl home path of the template

### update
（update template of the target category to the latest）

- --category, -c: the category of template, enum [api,rpc,model,docker,kube]
- --home: the goctl home path of the template

### revert
（revert the target template to the latest）

- --category, -c: the category of template, enum [api,rpc,model,docker,kube]
- --home: the goctl home path of the template
- --name, -n: the target file name of template

## completion
（generation completion script, it only works for unix-like OS）

### --name, -n: the filename of auto complete script, default is [goctl_autocomplete]




# goctl自动补全
goctl 自动补全仅支持 unix-like 操作系统

## 用法
```shell
$ goctl completion -h
NAME:
   goctl completion - generation completion script, it only works for unix-like OS

USAGE:
   goctl completion [command options] [arguments...]

OPTIONS:
   --name value, -n value  the filename of auto complete script, default is [goctl_autocomplete]
```

## 生成自动补全文件
```shell
$ goctl completion
generation auto completion success!
executes the following script to setting shell:
echo PROG=goctl source /Users/keson/.goctl/.auto_complete/zsh/goctl_autocomplete >> ~/.zshrc && source ~/.zshrc
or
echo PROG=goctl source /Users/keson/.goctl/.auto_complete/bash/goctl_autocomplete >> ~/.bashrc && source ~/.bashrc
```

## shell 配置
* zsh
```shell
$ echo PROG=goctl source /Users/keson/.goctl/.auto_complete/zsh/goctl_autocomplete >> ~/.zshrc && source ~/.zshrc
```
* bash
```shell
$ echo PROG=goctl source /Users/keson/.goctl/.auto_complete/bash/goctl_autocomplete >> ~/.bashrc && source ~/.bashrc
```

## 演示效果
使用 `tab` 键出现自动补全提示

```shell
$ goctl
api            -- generate api related files
bug            -- report a bug
completion     -- generation completion script, it only works for unix-like OS
docker         -- generate Dockerfile
help        h  -- Shows a list of commands or help for one command
kube           -- generate kubernetes files
migrate        -- migrate from tal-tech to zeromicro
model          -- generate model code
rpc            -- generate rpc code
template       -- template operation
upgrade        -- upgrade goctl to latest version
```
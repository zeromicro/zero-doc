# 模板操作

模板（Template）是数据驱动生成的基础，所有的代码（rest api、rpc、model、docker、kube）生成都会依赖模板，
默认情况下，模板生成器会选择内存中的模板进行生成，而对于有模板修改需求的开发者来讲，则需要将模板进行落盘，
从而进行模板修改，在下次代码生成时会加载指定路径下的模板进行生成。

## 使用帮助
```text
NAME:
   goctl template - template operation

USAGE:
   goctl template command [command options] [arguments...]

COMMANDS:
   init    initialize the all templates(force update)
   clean   clean the all cache templates
   update  update template of the target category to the latest
   revert  revert the target template to the latest

OPTIONS:
   --help, -h  show help
```

## 模板初始化
```text
NAME:
   goctl template init - initialize the all templates(force update)

USAGE:
   goctl template init [command options] [arguments...]

OPTIONS:
   --home value  the goctl home path of the template
```

## 清除模板
```text
NAME:
   goctl template clean - clean the all cache templates

USAGE:
   goctl template clean [command options] [arguments...]

OPTIONS:
   --home value  the goctl home path of the template
```

## 回滚指定分类模板
```text
NAME:
   goctl template update - update template of the target category to the latest

USAGE:
   goctl template update [command options] [arguments...]

OPTIONS:
   --category value, -c value  the category of template, enum [api,rpc,model,docker,kube]
   --home value                the goctl home path of the template
```

## 回滚模板
```text
NAME:
   goctl template revert - revert the target template to the latest

USAGE:
   goctl template revert [command options] [arguments...]

OPTIONS:
   --category value, -c value  the category of template, enum [api,rpc,model,docker,kube]
   --name value, -n value      the target file name of template
   --home value                the goctl home path of the template
```

> [!TIP]
> 
> `--home` 指定模板存储路径

## 模板加载

在代码生成时可以通过`--home`来指定模板所在文件夹，目前已支持指定模板目录的命令有：

- `goctl api go` 详情可以通过`goctl api go --help`查看帮助
- `goctl docker` 详情可以通过`goctl docker --help`查看帮助
- `goctl kube` 详情可以通过`goctl kube --help`查看帮助
- `goctl rpc new` 详情可以通过`goctl rpc new --help`查看帮助
- `goctl rpc proto` 详情可以通过`goctl rpc proto --help`查看帮助
- `goctl model mysql ddl` 详情可以通过`goctl model mysql ddl --help`查看帮助
- `goctl model mysql datasource` 详情可以通过`goctl model mysql datasource --help`查看帮助
- `goctl model pg datasource` 详情可以通过`goctl model pg datasource --help`查看帮助
- `goctl model mongo` 详情可以通过`goctl model mongo --help`查看帮助

默认情况（在不指定`--home`）会从`$HOME/.goctl`目录下读取。

## 使用示例
* 初始化模板到指定`$HOME/template`目录下
```text
$ goctl template init --home $HOME/template 
```

```text
Templates are generated in /Users/anqiansong/template, edit on your risk!
```

* 使用`$HOME/template`模板进行greet rpc生成
```text
$ goctl rpc new greet --home $HOME/template
```

```text
Done
```

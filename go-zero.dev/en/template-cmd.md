# Template Operation

Template is the basis of data-driven generation, all code (rest api, rpc, model, docker, kube) generation will rely on template.
By default, the template generator selects the in-memory template for generation, while for developers who need to modify the template, they need to drop the template and make template changes in the next code generation.
For developers who need to modify the templates, they need to modify the templates, and then the next time the code is generated, it will load the templates under the specified path to generate.

## Help
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

## Init
```text
NAME:
   goctl template init - initialize the all templates(force update)

USAGE:
   goctl template init [command options] [arguments...]

OPTIONS:
   --home value  the goctl home path of the template
```

## Clean
```text
NAME:
   goctl template clean - clean the all cache templates

USAGE:
   goctl template clean [command options] [arguments...]

OPTIONS:
   --home value  the goctl home path of the template
```

## Update
```text
NAME:
   goctl template update - update template of the target category to the latest

USAGE:
   goctl template update [command options] [arguments...]

OPTIONS:
   --category value, -c value  the category of template, enum [api,rpc,model,docker,kube]
   --home value                the goctl home path of the template
```

## Revert
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
> `--home` Specify the template storage path

## Template loading

You can specify the folder where the template is located by `--home` during code generation, and the commands that have been supported to specify the template directory are

- `goctl api go` Details can be found in `goctl api go --help` for help
- `goctl docker` Details can be viewed with `goctl docker --help`
- `goctl kube` Details can be viewed with `goctl kube --help`
- `goctl rpc new` Details can be viewed with `goctl rpc new --help`
- `goctl rpc proto` Details can be viewed with `goctl rpc proto --help`
- `goctl model mysql ddl` Details can be viewed with `goctl model mysql ddl --help`
- `goctl model mysql datasource` Details can be viewed with `goctl model mysql datasource --help`
- `goctl model postgresql datasource` Details can be viewed with `goctl model mysql datasource --help`
- `goctl model mongo` Details can be viewed with `goctl model mongo --help`

The default (when `--home` is not specified) is to read from the `$HOME/.goctl` directory.

## Example
* Initialize the template to the specified `$HOME/template` directory
```text
$ goctl template init --home $HOME/template 
```

```text
Templates are generated in /Users/anqiansong/template, edit on your risk!
```

* Greet rpc generation using `$HOME/template` template
```text
$ goctl rpc new greet --home $HOME/template
```

```text
Done
```
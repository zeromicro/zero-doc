---
sidebar_position: 6
---

# 模板管理

## 模板操作

模板（Template）是数据驱动生成的基础，所有的代码（rest api、rpc、model、docker、kube）生成都会依赖模板，
默认情况下，模板生成器会选择内存中的模板进行生成，而对于有模板修改需求的开发者来讲，则需要将模板进行落盘，
从而进行模板修改，在下次代码生成时会加载指定路径下的模板进行生成。

### 使用帮助
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

### 模板初始化
```text
NAME:
   goctl template init - initialize the all templates(force update)

USAGE:
   goctl template init [command options] [arguments...]

OPTIONS:
   --home value  the goctl home path of the template
```

### 清除模板
```text
NAME:
   goctl template clean - clean the all cache templates

USAGE:
   goctl template clean [command options] [arguments...]

OPTIONS:
   --home value  the goctl home path of the template
```

### 回滚指定分类模板
```text
NAME:
   goctl template update - update template of the target category to the latest

USAGE:
   goctl template update [command options] [arguments...]

OPTIONS:
   --category value, -c value  the category of template, enum [api,rpc,model,docker,kube]
   --home value                the goctl home path of the template
```

### 回滚模板
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

:::tip

`--home` 指定模板存储路径

:::

### 模板加载

在代码生成时可以通过`--home`来指定模板所在文件夹，目前已支持指定模板目录的命令有：

- `goctl api go` 详情可以通过`goctl api go --help`查看帮助
- `goctl docker` 详情可以通过`goctl docker --help`查看帮助
- `goctl kube` 详情可以通过`goctl kube --help`查看帮助
- `goctl rpc new` 详情可以通过`goctl rpc new --help`查看帮助
- `goctl rpc proto` 详情可以通过`goctl rpc proto --help`查看帮助
- `goctl model mysql ddl` 详情可以通过`goctl model mysql ddl --help`查看帮助
- `goctl model mysql datasource` 详情可以通过`goctl model mysql datasource --help`查看帮助
- `goctl model postgresql datasource` 详情可以通过`goctl model mysql datasource --help`查看帮助
- `goctl model mongo` 详情可以通过`goctl model mongo --help`查看帮助

默认情况（在不指定`--home`）会从`$HOME/.goctl`目录下读取。

### 使用示例
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

## 模板修改

### 场景
实现统一格式的body响应，格式如下：
```json 
{
  "code": 0,
  "msg": "OK",
  "data": {} // ①
}
```

① 实际响应数据

:::tip

`go-zero`生成的代码没有对其进行处理

:::

### 准备工作
我们提前在`module`为`greet`的工程下的`response`包中写一个`Response`方法，目录树类似如下：
```text
greet
├── response
│   └── response.go
└── xxx...
```

代码如下
```go 
package response

import (
	"net/http"

	"github.com/tal-tech/go-zero/rest/httpx"
)

type Body struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data,omitempty"`
}

func Response(w http.ResponseWriter, resp interface{}, err error) {
	var body Body
	if err != nil {
		body.Code = -1
		body.Msg = err.Error()
	} else {
		body.Msg = "OK"
		body.Data = resp
	}
	httpx.OkJson(w, body)
}
```

### 修改handler模板
```shell
$ vim ~/.goctl/api/handler.tpl
```
将模板替换为以下内容
```go 
package handler

import (
	"net/http"
	"greet/response"// ①
	{% raw %}
	{{.ImportPackages}}
	{% endraw %}
)

{% raw %}
func {{.HandlerName}}(ctx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		{{if .HasRequest}}var req types.{{.RequestType}}
		if err := httpx.Parse(r, &req); err != nil {
			httpx.Error(w, err)
			return
		}{{end}}

		l := logic.New{{.LogicType}}(r.Context(), ctx)
		{{if .HasResp}}resp, {{end}}err := l.{{.Call}}({{if .HasRequest}}req{{end}})
		{{if .HasResp}}response.Response(w, resp, err){{else}}response.Response(w, nil, err){{end}}//②
			
	}
}
{% endraw %}
```

① 替换为你真实的`response`包名，仅供参考

② 自定义模板内容

:::tip

如果本地没有`~/.goctl/api/handler.tpl`文件，可以通过模板初始化命令`goctl template init`进行初始化

:::

### 修改模板前后对比
* 修改前
```go 
func GreetHandler(ctx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.Request
		if err := httpx.Parse(r, &req); err != nil {
			httpx.Error(w, err)
			return
		}

		l := logic.NewGreetLogic(r.Context(), ctx)
		resp, err := l.Greet(req)
		// 以下内容将被自定义模板替换
		if err != nil {
			httpx.Error(w, err)
		} else {
			httpx.OkJson(w, resp)
		}
	}
}
```  
* 修改后
```go 
func GreetHandler(ctx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.Request
		if err := httpx.Parse(r, &req); err != nil {
			httpx.Error(w, err)
			return
		}

		l := logic.NewGreetLogic(r.Context(), ctx)
		resp, err := l.Greet(req)
		response.Response(w, resp, err)
	}
}
```

### 修改模板前后响应体对比

* 修改前
```json
{
    "message": "Hello go-zero!"
}
```

* 修改后
```json
{
    "code": 0,
    "msg": "OK",
    "data": {
        "message": "Hello go-zero!"
    }
}
```

## 总结
本文档仅对http相应为例讲述了自定义模板的流程，除此之外，自定义模板的场景还有：
* model 层添加kmq
* model 层生成待有效期option的model实例
* http自定义相应格式


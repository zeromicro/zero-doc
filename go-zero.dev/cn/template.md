# 模板修改

## 场景
实现统一格式的body响应，格式如下：
```json
{
  "code": 0,
  "msg": "OK",
  "data": {} // ①
}
```

① 实际响应数据

> [!TIP]
> `go-zero`生成的代码没有对其进行处理
## 准备工作
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

## 修改`handler`模板
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

> [!TIP]
>
> 1.如果本地没有`~/.goctl/api/handler.tpl`文件，可以通过模板初始化命令`goctl template init`进行初始化

## 修改模板前后对比
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

## 修改模板前后响应体对比

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

# 总结
本文档仅对http相应为例讲述了自定义模板的流程，除此之外，自定义模板的场景还有：
* model 层添加kmq
* model 层生成待有效期option的model实例
* http自定义相应格式
  ...

# 自定义错误返回

如果需要自定义api请求返回的http状态码和错误内容，可以通过 `httpx.SetErrorHandler` 来设置。示例如下：
```go
// 返回的结构体，json格式的body
type Message struct {
	Code int    `json:"code"`
	Desc string `json:"desc"`
}

// 定义错误处理函数
func errorHandler(err error) (int, interface{}) {
	return http.StatusConflict, Message{
		Code: -1,
		Desc: err.Error(),
	}
}

func main() {
    // 初始化，忽略了部分代码
	ctx := svc.NewServiceContext(c)
	server := rest.MustNewServer(c.RestConf)
	defer server.Stop()

    // 设置错误处理函数
	httpx.SetErrorHandler(errorHandler)
	handler.RegisterHandlers(server, ctx)
	server.Start()
}
```
这样自定义之后， `httpx.Error(...)` 调用会先经过自定义的 `errorHandler` 处理再返回。 


- `errorHandler` 返回的 `int` 作为 `http status code` 返回客户端
- 如果 `errorHandler` 返回的 `interface{}` 是 `error` 类型的话，那么会直接用 `err.Error()` 的内容以非 `json` 的格式返回客户端，不是 `error` 的话，那么会 `marshal` 成 `json` 再返回


<Vssue title="自定义错误返回" />

# Server

## 初始化


**rest.Server** 提供一个 HTTP API Gateway, 其可以通过 **rest.MustNewServer(RestConf)** 进行初始化。


```go
func MustNewServer(c RestConf, opts ...RunOption) *Server
```


其中 RestConf 相关定义可以参考 **rest.RestConf**，其定义了一批 HTTP 启动所需要的基本参数。


同时 RunOption 方法提供可扩展方法。目前支持如下几种：


- 请求认证鉴权失败的回调
```go
WithUnauthorizedCallback(handler.UnauthorizedCallback) RunOption
```

- 请求签名失败的回调
```go
WithUnsignedCallback(handler.UnauthorizedCallback) RunOption
```

- 自定义路由实现，默认采用的是 **router.PatRouter**
```go
WithRouter(router httpx.Router) RunOption
```


## 路由


go-zero 的路由实现是基于 **serach.Tree** 实现的。 路由可以通过如下的方式注册进去:


```go
engine := reset.MustNewServer(c)

engine.AddRoute(ngin.Route{
		Method:  http.MethodPost,
		Path:    "/user/login",
		Handler: login.LoginHandler(),
	})
```


Server 提供了2种方式，可以单条和批量的添加路由：


```go
// 批量添加
func (e *Server) AddRoutes(rs []Route, opts ...RouteOption)

// 单条添加
func (e *Server) AddRoute(r Route, opts ...RouteOption)
```


### Route


**Route** 是路由的一个基本单位，里面包含的参数如下:



| **param** | **说明** |
| --- | --- |
| Mehtod | 请求方式 **GET|POST|PUT|DELETE** |
| Path | 路由地址 |
| Handler | 处理器 |



### RouteOption


**RouteOption** 是对路由的一个扩展可选参数，目前支持如下几种：


#### WithJwt


```go
func WithJwt(secret string) RouteOption
```


添加 Jwt 认证鉴权，具体可以参考 **handler.Authorize**


#### WithJwtTransition


```go
func WithJwtTransition(secret, prevSecret string) RouteOption
```


添加 Jwt 认证鉴权，支持 2 个 secret。 当旧的 secret 需要弃用更新成新的时候，用于在 2 个 secret 过渡期间使用。


#### WithPriority


```go
func WithPriority() RouteOption
```


定义路由优先级，如果在服务 cpu 负载较高时，优先保证这些路由的正常使用，优先级低的将会优先丢弃。


#### WithSignature


```go
func WithSignature(signature SignatureConf) RouteOption
```


定义了路由的签名方式，具体参考 **handler.ContentSecurityHandler**


## Start 和 Stop


HTTP API Server 开始和停止的方法。


```go
func (e *Server) Start() 

func (e *Server) Stop()
```


## 添加自定义中间件


go-zero 支持添加自定义中间件功能，可以使用下面的方法进行添加


```go
func (e *Server) Use(middleware Middleware)
```


例如以下代码：


```go
func first(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("X-Middleware", "first")
		next(w, r)
	}
}

engine.Use(first)
```


<Vssue title="server" />

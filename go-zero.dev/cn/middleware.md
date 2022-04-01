# 中间件使用
在上一节，我们演示了怎么使用jwt鉴权，相信你已经掌握了对jwt的基本使用，本节我们来看一下api服务中间件怎么使用。

## 中间件分类
在go-zero中，中间件可以分为路由中间件和全局中间件，路由中间件是指某一些特定路由需要实现中间件逻辑，其和jwt类似，没有放在`jwt:xxx`下的路由不会使用中间件功能，
而全局中间件的服务范围则是整个服务。

## 中间件使用
这里以`search`服务为例来演示中间件的使用

### 路由中间件
* 重新编写`search.api`文件，添加`middleware`声明
    ```shell
    $ cd service/search/api
    $ vim search.api
    ```
    ```text
    type SearchReq struct {}
    
    type SearchReply struct {}
    
    @server(
        jwt: Auth
        middleware: Example // 路由中间件声明
    )
    service search-api {
        @handler search
        get /search/do (SearchReq) returns (SearchReply)
    }
    ```
* 重新生成api代码
    ```shell
    $ goctl api go -api search.api -dir . 
    ```
    ```text
    etc/search-api.yaml exists, ignored generation
    internal/config/config.go exists, ignored generation
    search.go exists, ignored generation
    internal/svc/servicecontext.go exists, ignored generation
    internal/handler/searchhandler.go exists, ignored generation
    internal/handler/pinghandler.go exists, ignored generation
    internal/logic/searchlogic.go exists, ignored generation
    internal/logic/pinglogic.go exists, ignored generation
    Done.
    ```
    生成完后会在`internal`目录下多一个`middleware`的目录，这里即中间件文件，后续中间件的实现逻辑也在这里编写。
*  完善资源依赖`ServiceContext`
    ```shell
    $ vim service/search/api/internal/svc/servicecontext.go
    ```
    ```go
    type ServiceContext struct {
        Config config.Config
        Example rest.Middleware
    }
    
    func NewServiceContext(c config.Config) *ServiceContext {
        return &ServiceContext{
            Config: c,
            Example: middleware.NewExampleMiddleware().Handle,
        }
    }
    ```
* 编写中间件逻辑
    这里仅添加一行日志，内容example middle，如果服务运行输出example middle则代表中间件使用起来了。
  
    ```shell
    $ vim service/search/api/internal/middleware/examplemiddleware.go
    ```
    ```go
    package middleware
    
    import "net/http"
    
    type ExampleMiddleware struct {
    }
    
    func NewExampleMiddleware() *ExampleMiddleware {
            return &ExampleMiddleware{}
    }
    
    func (m *ExampleMiddleware) Handle(next http.HandlerFunc) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
            // TODO generate middleware implement function, delete after code implementation
    
            // Passthrough to next handler if need
            next(w, r)
        }
    }
    ```
* 启动服务验证
    ```text
    {"@timestamp":"2021-02-09T11:32:57.931+08","level":"info","content":"example middle"}
    ```

### 全局中间件
通过rest.Server提供的Use方法即可
```go
func main() {
	flag.Parse()

	var c config.Config
	conf.MustLoad(*configFile, &c)

	ctx := svc.NewServiceContext(c)
	server := rest.MustNewServer(c.RestConf)
	defer server.Stop()

    // 全局中间件
	server.Use(func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			logx.Info("global middleware")
			next(w, r)
		}
	})
	handler.RegisterHandlers(server, ctx)

	fmt.Printf("Starting server at %s:%d...\n", c.Host, c.Port)
	server.Start()
}
```
```text
{"@timestamp":"2021-02-09T11:50:15.388+08","level":"info","content":"global middleware"}
```

### 在中间件里调用其它服务

通过闭包的方式把其它服务传递给中间件，示例如下：

```go
// 模拟的其它服务
type AnotherService struct{}

func (s *AnotherService) GetToken() string {
	return stringx.Rand()
}

// 常规中间件
func middleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("X-Middleware", "static-middleware")
		next(w, r)
	}
}

// 调用其它服务的中间件
func middlewareWithAnotherService(s *AnotherService) rest.Middleware {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			w.Header().Add("X-Middleware", s.GetToken())
			next(w, r)
		}
	}
}
```

完整代码参考：[https://github.com/zeromicro/zero-examples/tree/main/http/middleware](https://github.com/zeromicro/zero-examples/tree/main/http/middleware)


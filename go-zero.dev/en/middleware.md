# Middleware
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

In the previous section, we demonstrated how to use jwt authentication. I believe you have mastered the basic use of jwt. In this section, let’s take a look at how to use api service middleware.

## Middleware classification
In go-zero, middleware can be divided into routing middleware and global middleware. Routing middleware refers to certain specific routes that need to implement middleware logic, which is similar to jwt and does not place the routes under `jwt:xxx` Does not use middleware functions,
The service scope of global middleware is the entire service.

## Middleware use
Here we take the `search` service as an example to demonstrate the use of middleware

### Routing middleware
* Rewrite the `search.api` file and add the `middleware` declaration
    ```shell
    $ cd service/search/cmd/api
    $ vim search.api
    ```
    ```text
    type SearchReq struct {}
    
    type SearchReply struct {}
    
    @server(
        jwt: Auth
        middleware: Example // Routing middleware declaration
    )
    service search-api {
        @handler search
        get /search/do (SearchReq) returns (SearchReply)
    }
    ```
* Regenerate the api code
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
  After the generation is completed, there will be an additional `middleware` directory under the `internal` directory, which is the middleware file, and the implementation logic of the subsequent middleware is also written here.
*  Improve resource dependency `ServiceContext`
    ```shell
    $ vim service/search/cmd/api/internal/svc/servicecontext.go
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
* Write middleware logic
  Only one line of log is added here, with the content example middle. If the service runs and outputs example middle, it means that the middleware is in use.
  
    ```shell
    $ vim service/search/cmd/api/internal/middleware/examplemiddleware.go
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
* Start service verification
    ```text
    {"@timestamp":"2021-02-09T11:32:57.931+08","level":"info","content":"example middle"}
    ```

### Global middleware
call `rest.Server.Use`
```go
func main() {
	flag.Parse()

	var c config.Config
	conf.MustLoad(*configFile, &c)

	ctx := svc.NewServiceContext(c)
	server := rest.MustNewServer(c.RestConf)
	defer server.Stop()

    // Global middleware
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

### Call another service within the middleware

Pass another service into the middleware by closure, example as below:

```go
// simulated another service
type AnotherService struct{}

func (s *AnotherService) GetToken() string {
	return stringx.Rand()
}

// regular middleware
func middleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("X-Middleware", "static-middleware")
		next(w, r)
	}
}

// the middleware that calls another service
func middlewareWithAnotherService(s *AnotherService) rest.Middleware {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			w.Header().Add("X-Middleware", s.GetToken())
			next(w, r)
		}
	}
}
```

For full example, see: [https://github.com/zeromicro/zero-examples/tree/main/http/middleware](https://github.com/zeromicro/zero-examples/tree/main/http/middleware)
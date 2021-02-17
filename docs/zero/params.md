# params

**WithPathVars**


将动态路由中的路由参数与它的值放入请求提的上下文中，在自定义的`ServerHTTP`中实现了


```go
func (pr *PatRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
   reqPath := path.Clean(r.URL.Path)
   if tree, ok := pr.trees[r.Method]; ok {
      if result, ok := tree.Search(reqPath); ok {
         if len(result.Params) > 0 {
           //在当前的上下文中插入从前缀树中获取动态路由参数与它的值
            r = context.WithPathVars(r, result.Params)
         }
         result.Item.(http.Handler).ServeHTTP(w, r)
         return
      }
   }

   if allow, ok := pr.methodNotAllowed(r.Method, reqPath); ok {
      w.Header().Set(allowHeader, allow)
      w.WriteHeader(http.StatusMethodNotAllowed)
   } else {
      pr.handleNotFound(w, r)
   }
}
```


**Vars**


```go
func ParsePath(r *http.Request, v interface{}) error {
   vars := context.Vars(r)
   m := make(map[string]interface{}, len(vars))
   for k, v := range vars {
      m[k] = v
   }

   return pathUnmarshaler.Unmarshal(m, v)
}
```


进行参数反序列化的时候如果目标值是从path中读取，则从上下文中读取动态路由数据


<Vssue title="params" />

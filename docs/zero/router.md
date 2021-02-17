# router

router 作为联系之前的 Server「http服务器」和 我们编写的 handler「业务处理函数」的桥梁。go-zero 自实现了一套自己的路由系统。首先看看 Server 启动流程与 router 的配合：


## 基本结构


![1603611172390.jpg](https://cdn.nlark.com/yuque/0/2020/jpeg/261626/1603611546447-8123358c-b86d-49f7-a0de-c875cf00d283.jpeg#align=left&display=inline&height=981&margin=%5Bobject%20Object%5D&name=1603611172390.jpg&originHeight=981&originWidth=1554&size=223352&status=done&style=none&width=1554)


所以 router 从函数功能上：



| **Func Name** | **功能** |
| --- | --- |
| NewPatRouter | New pattern Router |
| Handle | 把 path 和 开发者自定义的 handler 函数绑定 |
| ServeHTTP | 根据传递过来的 Request，匹配之前注册的 URL 和处理函数，找到最匹配的项，进行处理。
「也只有实现了这个函数，才能成为 handler。然后去执行其他的 handler(其中就有开发者自己编写的)」 |



## example


简单 mock 一个http请求过程：
```go
func main() {
	r, err := http.NewRequest(http.MethodPost, "http://hello/testname/20",nil)
	if err != nil {
		log.Fatal(err)
		return
	}
	// 1. new Router
	router := router.NewPatRouter()

	// 2. register path, bind handler
	err = router.Handle(http.MethodPost, "/:name/:year", http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			v := struct {
				Name     string `path:"name"`
				Year     int    `path:"year"`
				Nickname string `form:"nickname"`
				Zipcode  int64  `form:"zipcode"`
				Location string `json:"location"`
				Time     int64  `json:"time"`
			}{}

			_ = httpx.Parse(r, &v)
			fmt.Println(v)
		}))
	if err != nil {
		log.Fatal(err)
		return
	}
	// 3.0 mock
	rr := httptest.NewRecorder()
	// 3. 开始处理请求，分发请求到不同的 handler 进行处理
	router.ServeHTTP(rr, r)
}

//{testname 20  0  0}
```


<Vssue title="router" />


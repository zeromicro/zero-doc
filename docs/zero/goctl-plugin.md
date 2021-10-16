# goctl plugin

goctl支持针对api自定义插件，那我怎么来自定义一个插件了？来看看下面最终怎么使用的一个例子。


```bash
$ goctl api plugin -p goctl-android="android -package com.tal" -api user.api -dir .
```
上面这个命令可以分解成如下几部：

1. goctl 解析api文件
1. goctl 将解析后的结构 [ApiSpec](https://github.com/zeromicro/go-zero/blob/16bfb1b7be2db014348b6be9a0e0abe0f765cd38/tools/goctl/api/spec/spec.go) 和参数传递给goctl-android可执行文件
1. goctl-android 根据 [ApiSpec](https://github.com/zeromicro/go-zero/blob/16bfb1b7be2db014348b6be9a0e0abe0f765cd38/tools/goctl/api/spec/spec.go) 结构体自定义生成逻辑。



此命令前面部分 `goctl api plugin -p` 是固定参数，`goctl-android="android -package com.tal"` 是plugin参数，其中goctl-android是插件二进制文件，`android -package com.tal`是插件的自定义参数，`-api user.api -dir .`是goctl通用自定义参数。
## 怎么编写自定义插件？


go-zero框架中包含了一个很简单的自定义插件 [demo](https://github.com/zeromicro/go-zero/blob/master/tools/goctl/plugin/demo/goctlplugin.go)，代码如下：
```go
package main

import (
	"fmt"

	"github.com/tal-tech/go-zero/tools/goctl/plugin"
)

func main() {
	plugin, err := plugin.NewPlugin()
	if err != nil {
		panic(err)
	}

	if plugin.Api != nil {
		fmt.Printf("api: %+v \n", plugin.Api)
	}
	fmt.Printf("dir: %s \n", plugin.Dir)
	fmt.Println("Enjoy anything you want.")
}

```


`plugin, err := plugin.NewPlugin()` 这行代码作用是解析从goctl传递过来的数据，里面包含如下部分内容：
```go
type Plugin struct {
	Api   *spec.ApiSpec
	Style string
	Dir   string
}
```
> Api定义了api文件的结构数据
> Style 是可选参数，可以用来控制文件命名规范
> Dir 工作目录



### 介绍一个完整的基于plugin实现的android plugin


[https://github.com/zeromicro/goctl-android](https://github.com/zeromicro/goctl-android)


<Vssue title="goctlplugin" />

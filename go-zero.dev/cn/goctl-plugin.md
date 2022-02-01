# plugin命令

goctl支持针对api自定义插件，那我怎么来自定义一个插件了？来看看下面最终怎么使用的一个例子。
```go
$ goctl api plugin -p goctl-android="android -package com.tal" -api user.api -dir .
```

上面这个命令可以分解成如下几步：
* goctl 解析api文件
* goctl 将解析后的结构 ApiSpec 和参数传递给goctl-android可执行文件
* goctl-android 根据 ApiSpec 结构体自定义生成逻辑。 

此命令前面部分 goctl api plugin -p 是固定参数，goctl-android="android -package com.tal" 是plugin参数，其中goctl-android是插件二进制文件，android -package com.tal是插件的自定义参数，-api user.api -dir .是goctl通用自定义参数。
## 怎么编写自定义插件？
go-zero框架中包含了一个很简单的自定义插件 demo，代码如下：
```go
package main

import (
    "fmt"
    
    "github.com/zeromicro/go-zero/tools/goctl/plugin"
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

`plugin, err := plugin.NewPlugin()` 这行代码作用是解析从goctl传递过来的数据，里面包含如下部分内容：

```go
type Plugin struct {
    Api   *spec.ApiSpec
    Style string
    Dir   string
}
```
> [!TIP]
> Api：定义了api文件的结构数据
> 
> Style：可选参数，可以用来控制文件命名规范
> 
> Dir：工作目录


完整的基于plugin实现的android plugin演示项目
[https://github.com/zeromicro/goctl-android](https://github.com/zeromicro/goctl-android)

# 猜你想看
* [api目录](api-dir.md)
* [api语法](api-grammar.md)
* [api配置](api-config.md)
* [api命令介绍](goctl-api.md)

---
sidebar_position: 5
---

# Plugin

goctl supports custom plugins for api, so how do I customize a plugin? Take a look at an example of how to use it in the end below.

```go
$ goctl api plugin -p goctl-android="android -package com.tal" -api user.api -dir .
```

The above command can be broken down into the following steps.
* goctl parses the api file
* goctl passes the parsed structure ApiSpec and parameters to the goctl-android executable
* goctl-android generates custom logic based on the ApiSpec structure.

The first part of this command goctl api plugin -p is a fixed parameter, goctl-android="android -package com.tal" is the plugin parameter, where goctl-android is the plugin binary, android -package com.tal is the custom parameter of the plugin parameter, -api user.api -dir . is the goctl generic custom parameter.

## How to write custom plug-ins?

The go-zero framework includes a very simple custom plugin demo with the following code.

```go title="plugin.go"
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

`plugin, err := plugin.NewPlugin()` This line of code serves to parse the data passed from goctl, which contains the following parts.

```go 
type Plugin struct {
    Api   *spec.ApiSpec
    Style string
    Dir   string
}
```

:::tip 

Api: defines the structure data of the api file

Style: optional parameter that can be used to control the file naming convention

Dir: working directory

:::

The complete plugin-based implementation of the android plugin demo project
[https://github.com/zeromicro/goctl-android](https://github.com/zeromicro/goctl-android)

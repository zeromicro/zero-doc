# Plugin Commands
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

Goctl supports custom plugins for api, so how do I customize a plugin? Let's take a look at an example of how to finally use it below.
```go
$ goctl api plugin -p goctl-android="android -package com.tal" -api user.api -dir .
```

The above command can be broken down into the following steps:
* goctl parsing api file
* goctl passes the parsed structure ApiSpec and parameters to the goctl-android executable file
* goctl-android customizes the generation logic according to the ApiSpec structure. 

The first part of this command goctl api plugin -p is a fixed parameter, goctl-android="android -package com.tal" is a plugin parameter, where goctl-android is the plugin binary file, and android -package com.tal is a custom parameter of the plugin , -Api user.api -dir. Is a common custom parameter for goctl.
## How to write a custom plug-in?
A very simple custom plug-in demo is included in the go-zero framework. The code is as follows:
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

`plugin, err := plugin.NewPlugin()` The function of this line of code is to parse the data passed from goctl, which contains the following parts:

```go
type Plugin struct {
    Api   *spec.ApiSpec
    Style string
    Dir   string
}
```
> [!TIP]
> Api: defines the structure data of the api file
> 
> Style: optional, it is used to control file naming conventions
> 
> Dir: workDir


Complete android plugin demo project based on plugin
[https://github.com/zeromicro/goctl-android](https://github.com/zeromicro/goctl-android)

# Guess you wants
* [API Directory Structure](api-dir.md)
* [API IDL](api-grammar.md)
* [API Configuration](api-config.md)
* [API Commands](goctl-api.md)
---
sidebar_position: 0
---

# Intellij Plugin

## Go-Zero Plugin

## Introduction
A plug-in tool that supports go-zero api language structure syntax highlighting, detection and api, rpc, model quick generation.


## idea version requirements
* IntelliJ 2019.3+ (Ultimate or Community)
* Goland 2019.3+
* WebStorm 2019.3+
* PhpStorm 2019.3+
* PyCharm 2019.3+
* RubyMine 2019.3+
* CLion 2019.3+

## Versioning Features
* api syntax highlighting
* api syntax, semantic detection
* struct, route, handler duplicate definition detection
* type jump to type declaration location
* context menu support api, rpc, mode related menu options
* Code formatting (option+command+L)
* Code hinting

## Installation method

### Way one
Find the latest zip package in github's release, download it and install it locally. (No need to decompress)

### Way two
In the plugin store, search for `Goctl` and install it


## Preview
![preview](/img/api-compare.png)

## New Api(Proto) file
In the project area target folder `Right click->New-> New Api(Proto) File ->Empty File/Api(Proto) Template`, as shown in the figure.
![preview](/img/api-new.png)

# Quickly generate api/rpc service
In the target folder `Right click->New->Go Zero -> Api Greet Service/Rpc Greet Service`

![preview](/img/service.png)

# Api/Rpc/Model Code generation

## Method 1 (project area)

Corresponding files (api, proto, sql) `Right click->New->Go Zero-> Api/Rpc/Model Code`, as shown in the figure.

![preview](/img/project_generate_code.png)

## Method 2 (edit area)
Corresponding file (api, proto, sql) `Right click -> Generate -> Api/Rpc/Model Code`


## Error message
! [context menu](/img/alert.png)


# Live Template
Live Template can speed up the writing of api files, for example, if we enter the `main` keyword in the go file according to tip, a template code will be inserted
```go
func main(){

}
```
Or maybe you'll be more familiar with the following image, where you defined the template once upon a time
! [context menu](/img/go_live_template.png)

Let's get into the template usage instructions in today's api syntax, and let's see the effect of the service template
! [context menu](/img/live_template.gif)

First of all, let's take a look at a few areas of the api file where the template is in effect (the psiTree element area)
! [context menu](/img/psiTree.png)

#### Preset templates and effective areas
| Template Keywords | psiTree Effective Area | Description
| ---- | ---- | ---- | 
| @doc | ApiService |doc annotation template|
| doc | ApiService |doc annotation template|
| struct |struct |struct declaration template|
| info | ApiFile |info block template|
| type | ApiFile |type group template|
| handler | ApiService |handler filename template|
| get | ApiService |get method routing template|
| head | ApiService |head method routing template|
| post | ApiService |post method routing template|
| put | ApiService |put method routing template|
| delete | ApiService |delete method routing template|
| connect | ApiService |connect method routing template|
| options | ApiService |options method routing template|
| trace | ApiService |trace method routing template|
| service | ApiFile |service service block template|
| json | Tag, Tag literal |tag template|
| xml | Tag, Tag literal |tag template|
| path | Tag, Tag literal |tag template|
| form | Tag, Tag literal |tag template|

About each template corresponding content can be seen in `Goland(mac Os)->Preference->Editor->Live Templates-> Api|Api Tags` in the detailed template content, such as json tag template content as

```go
json:"$FIELD_NAME$"
```

![context menu](/img/json_tag.png)



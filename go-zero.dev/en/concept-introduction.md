# Concepts

> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)


## go-zero
go-zero is a web and rpc framework that with lots of engineering practices builtin. It’s born to ensure the stability of the busy services with resilience design, and has been serving sites with tens of millions users for years.

## goctl
An auxiliary tool designed to improve engineering efficiency and reduce error rates for developers.

## goctl plugins
Refers to the peripheral binary resources centered on goctl, which can meet some personalized code generation requirements, such as the routing merge plug-in `goctl-go-compact` plug-in,
The `goctl-swagger` plugin for generating swagger documents, the `goctl-php` plugin for generating the php caller, etc.

## intellij/vscode plugins
A plug-in developed with goctl on the intellij series products, which replaces the goctl command line operation with the UI.

## api file
An api file refers to a text file used to define and describe an api service. It ends with the .api suffix and contains IDL of the api syntax.

## goctl environment
The goctl environment is the preparation environment before using goctl, including:
* golang environment
* protoc
* protoc-gen-go plugin
* go module | gopath

## go-zero-demo
Go-zero-demo contains a large repository of all the source code in the document. When we write the demo in the future, we all create sub-projects under this project.
Therefore, we need to create a large warehouse in advance `go-zero-demo`, and I put this warehouse in the home directory here.

```shell
$ cd ~
$ mkdir go-zero-demo&&cd go-zero-demo
$ go mod init go-zero-demo
```


# Reference
* [go-zero](README.md)
* [Goctl](goctl.md)
* [Plugins](plugin-center.md)
* [Tools](tool-center.md)
* [API IDL](api-grammar.md)
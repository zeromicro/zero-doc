# Concepts

## go-zero
go-zero is a batteries-included web and rpc framework that incorporates many known-good engineering practices. It was created with the goal of allowing developers to rapidly develop resilient services with rock-solid stability, and has been used to develop web applications with tens of millions users.

## goctl
`goctl` is an auxiliary tool designed to improve engineering efficiency and reduce error rates for developers by reducing the amount of boilerplate necessary for services to communicate with each other.

## goctl plugins
`goctl` has an extensible plugin system with multiple plugins already created. These plugins allow developers to generate boilerplate code and configuration for other architecture elements. Examples include `goctl-go-compact` which merges all goctl-generated routes into one file, the `goctl-swagger` plugin for generating swagger documents from api definitions, or the `goctl-php` plugin for generating php client code, etc.

## IntelliJ/Visual Studio Code plugins
There are also plugins available for the IntelliJ family of IDEs as well as for Visual Studio Code. These plugins expose the CLI functions in the interface of the IDE and provide additional syntax highlighting for API definition files.

## API file
An API file refers to the plaintext file used to define and describe an API service. It ends with the `.api` suffix and contains an IDL (Interface Description Language) describing the API syntax.

## goctl environment
In order to use `goctl` the following is required:
* a golang environment
* `protoc`, the protobuf compiler
* the `protoc-gen-go` plugin
* a go project either using go modules or on the GOPATH

If you don't have all of this setup, please visit the [prepare](prepare.md) of the documentation to get started.

## go-zero-demo
Next up are some quickstart demos to get started with go-zero. Since these demos will be sizable after all the code is generated, it is recommended you create a `go-zero-demo` directory to house it all.
See below for how to create this in your home directory.

```shell
$ cd ~
$ mkdir go-zero-demo && cd go-zero-demo
$ go mod init go-zero-demo
```


# Reference
* [go-zero](README.md)
* [Goctl](goctl.md)
* [Plugins](plugin-center.md)
* [Tools](tool-center.md)
* [API IDL](api-grammar.md)
---
sidebar_position: 1
---

# Concept

### go-zero

A variety of engineering practices in one web and rpc framework.

### goctl

An aid designed to improve engineering efficiency and reduce error rates for developers.

### goctl plugin

Refers to goctl-centric peripheral binary resources that can meet some personalized code generation needs, such as the route merge plugin `goctl-go-compact` plugin, the
The `goctl-swagger` plugin for generating swagger documents, the `goctl-php` plugin for generating php call-side, etc.

### intellij/vscode plugin

A plugin developed with goctl on the intellij product line, which replaces goctl command line operations with UI.

### api file

The api file is a text file used to define and describe the api service, which ends with the .api suffix and contains the api syntax description content.

### goctl environment

The goctl environment is the preparation environment before using goctl and contains:
* golang environment
* protoc
* protoc-gen-go plugin
* go module | gopath

### go-zero-demo
go-zero-demo contains a large repository of all the source code in the documentation, and we create subprojects under this project when we write the demo.
So we need to create a big repository `go-zero-demo` in advance, I put this repository here in the home directory.

```shell
$ cd ~
$ mkdir go-zero-demo&&cd go-zero-demo
$ go mod init go-zero-demo
```
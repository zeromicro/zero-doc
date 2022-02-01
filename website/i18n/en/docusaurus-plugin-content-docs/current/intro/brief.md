---
sidebar_position: 1
---

# Introduction 

go-zero is an integrated web and rpc framework for a variety of engineering practices. The elastic design guarantees the stability of the large concurrent server and has been fully tested in the field.

go-zero includes the minimal API definition and generation tool goctl, which can generate Go, iOS, Android, Kotlin, Dart, TypeScript, JavaScript code based on the defined api file with one click and can be run directly.

Benefits of using go-zero:

- :white_check_mark: Easy to get the stability to support 10 million daily service.
- :white_check_mark: Built-in cascade timeout control, current limiting, adaptive fusing, adaptive load shedding and other microservice governance capabilities without configuration and additional code.
- :white_check_mark: Microservice governance middleware can be seamlessly integrated with other existing frameworks.
- :white_check_mark: Minimal API description, one-click code generation for each end.
- :white_check_mark: Automatic verification of the legitimacy of client request parameters.
- :white_check_mark: Extensive microservice governance and concurrency toolkit.

<img src="https://gitee.com/kevwan/static/raw/master/doc/images/architecture.png" alt="架构图" width="1500" />

## go-zero framework background

In early 18, we decided to migrate from a `Java+MongoDB` monolithic architecture to a microservices architecture, and after careful thought and comparison, we decided that:

* Go-based language
    * Efficient performance
    * Simple syntax
    * Extensively proven engineering efficiency
    * Ultimate deployment experience
    * Extremely low server-side resource costs
* Self-developed microservices framework
    * A lot of experience in self-researching microservices frameworks
    * Need to have faster problem location
    * Easier to add new features
    
## go-zero framework design thinking

For the design of the microservice framework, we expect to guarantee the stability of microservices while paying special attention to R&D efficiency. So at the beginning of the design, we have some guidelines as follows.

* Keep it simple, the first principle
* resilient design, fault-oriented programming
* Tools over conventions and documentation
* High availability
* Highly concurrent
* Easy to scale
* Business development friendly, encapsulating complexity
* Constraints do one thing only one way

In less than half a year, we completely completed the migration from `Java+MongoDB` to `Golang+MySQL` as the main microservice system, and it was fully online at the end of August 18, which has guaranteed the subsequent rapid growth of business and ensured the high availability of the whole service.

## go-zero project implementation and features

go-zero is an integrated web and rpc framework with various engineering practices, with the following key features.

* powerful tool support, as little code as possible to write
* minimalist interface
* fully compatible with net/http
* middleware support for easy extensions
* high performance
* Fault-oriented programming, resilient design
* Built-in service discovery, load balancing
* Built-in flow limiting, meltdown, load shedding, and auto-trigger, auto-recovery
* Automatic API parameter validation
* Timeout cascade control
* Automatic cache control
* Link tracking, statistical alarms, etc.
* High concurrency support, stable to ensure the daily traffic flood during the epidemic

In the figure below, we guarantee high availability of the overall service on several levels.

[Flexible design](https://gitee.com/kevwan/static/raw/master/doc/images/resilience.jpg)

If you think it's good, don't forget to **star** 👏

## Quick Start

#### For the full example, please see

   [Quick Build Highly Concurrent Microservices](https://github.com/zeromicro/zero-doc/blob/main/doc/shorturl.md)

   [Quick Build Highly Concurrent Microservices - Multi RPC Edition](https://github.com/zeromicro/zero-doc/blob/main/docs/zero/bookstore.md)
   
#### Install the `goctl` tool

`goctl` is pronounced as `go control`, not as `go C-T-L`. `goctl` means not to be controlled by the code, but to control it. Where `go` does not mean `golang`. When I designed `goctl`, I wanted to use `her
to free our hands 👈

```shell
GO111MODULE=on GOPROXY=https://goproxy.cn/,direct go get -u github.com/zeromicro/go-zero/tools/goctl
```

If you are using go1.16, you can install it with the `go install` command

```shell
GOPROXY=https://goproxy.cn/,direct go install github.com/zeromicro/go-zero/tools/goctl@latest
```

Ensure that `goctl` is executable

#### Quick Generate api Service

```shell
goctl api new greet
cd greet
go mod init
go mod tidy
go run greet.go -f etc/greet-api.yaml
```

The default listener is on port `8888` (which can be changed in the configuration file) and can be requested via curl at

```shell
curl -i http://localhost:8888/from/you
```

Returns the following:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Date: Thu, 22 Oct 2020 14:03:18 GMT
Content-Length: 14

{"message":""}
```

Writing business code.

* The api file defines the routes that the service exposes to the public
* You can pass dependencies to the logic in servicecontext.go, such as mysql, redis, etc.
* Add business processing logic to the logic corresponding to the get/post/put/delete requests defined in the api

#### can generate Java, TypeScript, Dart, JavaScript code needed for front-end based on api file

```shell
goctl api java -api greet.api -dir greet
goctl api dart -api greet.api -dir greet
...
```

## Benchmark

![benchmark](https://gitee.com/kevwan/static/raw/master/doc/images/benchmark.png)

[The test code is available here](https://github.com/smallnest/go-web-framework-benchmark)

* awesome series (more articles in 『microservices practice』public)
    * [Quickly Building Highly Concurrent Microservices](https://github.com/zeromicro/zero-doc/blob/main/doc/shorturl.md)
    * [Quickly Building Highly Concurrent Microservices - Multi RPC Edition](https://github.com/zeromicro/zero-doc/blob/main/docs/zero/bookstore.md)
    
* Featured `goctl` plugin

<table>
    <tr>
        <td>Plugin </td> <td>Application </td>
    </tr>
    <tr>
        <td><a href="https://github.com/zeromicro/goctl-swagger">goctl-swagger</a></td> <td>One Click Generation <code>api</code> of <code>swagger</code> Documentation </td>
    </tr>
    <tr>
        <td><a href="https://github.com/zeromicro/goctl-android">goctl-android</a></td> <td> Generation <code>java (android)</code> End <code>http client</code> Request codes</td>
    </tr>
    <tr>
        <td><a href="https://github.com/zeromicro/goctl-go-compact">goctl-go-compact</a> </td> <td>Merge <code>api</code> the same <code>group</code> Inside the <code>handler</code> to a go file</td>
    </tr>
    </table>
    
## WeChat public number

`go-zero` related articles will be presented in `microservices practice` public number, welcome to scan the code to pay attention to, also can through the public number private message me 👏

<img src="https://zeromicro.github.io/go-zero-pages/resource/go-zero-practise.png" alt="wechat" width="300" />

## WeChat Exchange Group

If there are any queries that are not covered in the documentation, you are welcome to ask in the group and we will reply as soon as possible.

You can suggest any improvement in use in the group, and we will consider the reasonableness and modify it as soon as possible.

If you find ***bug*** please mention ***issue*** in time, we will confirm and modify as soon as possible.

In order to prevent advertising users, identify technical peers, please ***star*** after adding me specify **github** current ***star*** number, I then pull into the **go-zero** group, thanks!

Before adding me, please click ***star***, a small ***star*** is the motivation for the authors to answer a lot of questions 🤝

<img src="https://raw.githubusercontent.com/zeromicro/zero-doc/main/doc/images/wechat.jpg" alt="wechat" width="300" />

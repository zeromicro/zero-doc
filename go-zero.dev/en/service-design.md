# Directory Structure
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

Directory splitting refers to the directory splitting in line with the best practices of go-zero, which is related to the splitting of microservices. In the best practice within the team,
We split a system into multiple subsystems according to the horizontal division of the business, and each subsystem should have an independent persistent storage and cache system.
For example, a shopping mall system needs to consist of a user system (user), a product management system (product), an order system (order), a shopping cart system (cart), a settlement center system (pay), an after-sale system (afterSale), etc.

## System structure analysis
In the mall system mentioned above, while each system provides services to the outside (http), it also provides data to other subsystems for data access interfaces (rpc), so each subsystem can be split into a service , And provides two external ways to access the system, api and rpc, therefore,
The above system is divided into the following structure according to the directory structure:

```text
.
├── afterSale
│   ├── api
│   └── rpc
├── cart
│   ├── api
│   └── rpc
├── order
│   ├── api
│   └── rpc
├── pay
│   ├── api
│   └── rpc
├── product
│   ├── api
│   └── rpc
└── user
    ├── api
    └── rpc
```

## rpc call chain suggestion
When designing the system, try to make the call between services one-way in the chain instead of cyclically. For example, the order service calls the user service, and the user service does not call the order service in turn.
When one of the services fails to start, it will affect each other and enter an infinite loop. You order to think it is caused by the user service failure, and the user thinks it is caused by the order service. If there are a large number of services in a mutual call chain,
You need to consider whether the service split is reasonable.

## Directory structure of common service types
Among the above services, only api/rpc services are listed. In addition, there may be more service types under one service, such as rmq (message processing system), cron (timed task system), script (script), etc. ,
Therefore, a service may contain the following directory structure:

```text
user
    ├── api //  http access service, business requirement realization
    ├── cronjob // Timed task, timed data update service
    ├── rmq // Message processing system: mq and dq, handle some high concurrency and delay message services
    ├── rpc // rpc service to provide basic data access to other subsystems
    └── script // Script, handle some temporary operation requirements, and repair temporary data
```

## Example of complete project directory structure
```text
mall // 工程名称
├── common // 通用库
│   ├── randx
│   └── stringx
├── go.mod
├── go.sum
└── service // 服务存放目录
    ├── afterSale
    │   ├── api
    │   └── model
    │   └── rpc
    ├── cart
    │   ├── api
    │   └── model
    │   └── rpc
    ├── order
    │   ├── api
    │   └── model
    │   └── rpc
    ├── pay
    │   ├── api
    │   └── model
    │   └── rpc
    ├── product
    │   ├── api
    │   └── model
    │   └── rpc
    └── user
        ├── api
        ├── cronjob
        ├── model
        ├── rmq
        ├── rpc
        └── script
```

# Guess you wants
* [API Directory Structure](api-dir.md)

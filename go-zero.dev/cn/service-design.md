# 目录拆分
目录拆分是指配合go-zero的最佳实践的目录拆分，这和微服务拆分有着关联，在团队内部最佳实践中，
我们按照业务横向拆分，将一个系统拆分成多个子系统，每个子系统应拥有独立的持久化存储，缓存系统。
如一个商城系统需要有用户系统(user)，商品管理系统(product)，订单系统(order)，购物车系统(cart)，结算中心系统(pay)，售后系统(afterSale)等组成。

## 系统结构分析
在上文提到的商城系统中，每个系统在对外（http）提供服务的同时，也会提供数据给其他子系统进行数据访问的接口（rpc），因此每个子系统可以拆分成一个服务，而且对外提供了两种访问该系统的方式api和rpc，因此，
以上系统按照目录结构来拆分有如下结构:

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

## rpc调用链建议
在设计系统时，尽量做到服务之间调用链是单向的，而非循环调用，例如：order服务调用了user服务，而user服务反过来也会调用order的服务，
当其中一个服务启动故障，就会相互影响，进入死循环，你order认为是user服务故障导致的，而user认为是order服务导致的，如果有大量服务存在相互调用链，
则需要考虑服务拆分是否合理。

## 常见服务类型的目录结构
在上述服务中，仅列举了api/rpc服务，除此之外，一个服务下还可能有其他更多服务类型，如rmq（消息处理系统），cron（定时任务系统），script（脚本）等，
因此一个服务下可能包含以下目录结构：
```text
user
    ├── api //  http访问服务，业务需求实现
    ├── cronjob // 定时任务，定时数据更新业务
    ├── rmq // 消息处理系统：mq和dq，处理一些高并发和延时消息业务
    ├── rpc // rpc服务，给其他子系统提供基础数据访问
    └── script // 脚本，处理一些临时运营需求，临时数据修复
```

## 完整工程目录结构示例
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

# 猜你想看
* [api目录结构介绍](api-dir.md)

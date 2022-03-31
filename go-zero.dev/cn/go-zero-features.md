# go-zero特性

go-zero 是一个集成了各种工程实践的包含 web 和 rpc 框架，有如下主要特点：

* 强大的工具支持，尽可能少的代码编写
* 极简的接口
* 完全兼容 net/http
* 支持中间件，方便扩展
* 高性能
* 面向故障编程，弹性设计
* 内建服务发现、负载均衡
* 内建限流、熔断、降载，且自动触发，自动恢复
* API 参数自动校验
* 超时级联控制
* 自动缓存控制
* 链路跟踪、统计报警等
* 高并发支撑，稳定保障了疫情期间每天的流量洪峰

如下图，我们从多个层面保障了整体服务的高可用：

![弹性设计](https://raw.githubusercontent.com/zeromicro/zero-doc/main/doc/images/resilience.jpg)
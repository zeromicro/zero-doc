# handler

主要列举一下 http 请求过程中涉及到的中间件，以及 `go-zero` 已经帮我们内置的中间件。


## 内置中间件



| **name** | **作用** |
| --- | --- |
| TraceHandler | 链路追踪，请求上下文spanId |
| LogHandler | 日志处理器 |
| [BreakHandler](https://www.yuque.com/oern4r/gmzgsa/daur2h) | 熔断器 |
| SheddingHandler | 降载，CPU负载过高可以直接拒绝请求 |
| RecoverHandler | 程序出现异常错误，recover恢复机制 |
| MetricHandler | 请求指标记录 |
| PromethousHandler | Promethous 监控 |
| MaxBytesHandler | 控制 http 消息长度「Content-length」 |
| GunzipHandler | gzip 编码 |



## 插件中间件



| **name** | **作用** |
| --- | --- |
| [Authhandler](https://www.yuque.com/oern4r/gmzgsa/lqx4ub) | 授权中间件「JWT」 |
| [Cryptionhandler](https://www.yuque.com/oern4r/gmzgsa/bpe6sq) | 验签中间件 |
|  |  |


<Vssue title="handler" />

# logx


## 使用示例

```go
var c logx.LogConf
// 从 yaml 文件中 初始化配置
conf.MustLoad("config.yaml", &c)

// logx 根据配置初始化
logx.MustSetup(c)

logx.Info("This is info!")
logx.Infof("This is %s!", "info")

logx.Error("This is error!")
logx.Errorf("this is %s!", "error")

logx.Close()
```

## 初始化
logx 有很多可以配置项，可以参考 logx.LogConf 中的定义。目前可以使用

```go
logx.MustSetUp(c)
```
进行初始化配置，如果没有进行初始化配置，所有的配置将使用默认配置。

## Level
logx 支持的打印日志级别有：
- alert
- info
- error
- severe
- fatal
- slow
- stat

可以使用对应的方法打印出对应级别的日志。
同时为了方便调试，线上使用，可以动态调整日志打印级别，其中可以通过 **logx.SetLevel(uint32)** 进行级别设置，也可以通过配置初始化进行设置。目前支持的参数为：

```go
const (
	// 打印所有级别的日志
	InfoLevel = iota
	// 打印 errors, slows, stacks 日志
	ErrorLevel
	// 仅打印 server 级别日志
	SevereLevel
)
```

## 日志模式
目前日志打印模式主要分为2种，一种文件输出，一种控制台输出。推荐方式，当采用 k8s，docker 等部署方式的时候，可以将日志输出到控制台，使用日志收集器收集导入至 es 进行日志分析。如果是直接部署方式，可以采用文件输出方式，logx 会自动在指定文件目录创建对应 5 个对应级别的的日志文件保存日志。

```bash
.
├── access.log
├── error.log
├── severe.log
├── slow.log
└── stat.log
```

同时会按照自然日进行文件分割，当超过指定配置天数，会对日志文件进行自动删除，打包等操作。

## 禁用日志
如果不需要日志打印，可以使用 **logx.Close()** 关闭日志输出。注意，当禁用日志输出，将无法在次打开，具体可以参考 **logx.RotateLogger** 和 **logx.DailyRotateRule** 的实现。

## 关闭日志
因为 logx 采用异步进行日志输出，如果没有正常关闭日志，可能会造成部分日志丢失的情况。必须在程序退出的地方关闭日志输出：
```go
logx.Close()
```
框架中 rest 和 zrpc 等大部分地方已经做好了日志配置和关闭相关操作，用户可以不用关心。
同时注意，当关闭日志输出之后，将无法在次打印日志了。

推荐写法：
```go
import "github.com/tal-tech/go-zero/core/proc"

// grace close log
proc.AddShutdownListener(func() {
	logx.Close()
})
```

## Duration
我们打印日志的时候可能需要打印耗时情况，可以使用 **logx.WithDuration(time.Duration)**, 参考如下示例：

```go
startTime := timex.Now()
// 数据库查询
rows, err := conn.Query(q, args...)
duration := timex.Since(startTime)
if duration > slowThreshold {
    logx.WithDuration(duration).Slowf("[SQL] query: slowcall - %s", stmt)
} else {
    logx.WithDuration(duration).Infof("sql query: %s", stmt)
}
```


会输出如下格式

```json
{"@timestamp":"2020-09-12T01:22:55.552+08","level":"info","duration":"3.0ms","content":"sql query:..."}
{"@timestamp":"2020-09-12T01:22:55.552+08","level":"slow","duration":"500ms","content":"[SQL] query: slowcall - ..."}
```

这样就可以很容易统计出慢 sql 相关信息。

## TraceLog
tracingEntry 是为了链路追踪日志输出定制的。可以打印 context 中的 traceId 和 spanId 信息，配合我们的 **rest** 和 **zrpc** 很容易完成链路日志的相关打印。示例如下

```go
logx.WithContext(context.Context).Info("This is info!")
```


## SysLog

应用中可能有部分采用系统 log 进行日志打印，logx 同样封装方法，很容易将 log 相关的日志收集到 logx 中来。

```go
logx.CollectSysLog()
```




# 日志配置相关
**LogConf** 定义日志系统所需的基本配置

完整定义如下：

```go
type LogConf struct {
	ServiceName         string `json:",optional"`
	Mode                string `json:",default=console,options=console|file|volume"`
	Path                string `json:",default=logs"`
	Level               string `json:",default=info,options=info|error|severe"`
	Compress            bool   `json:",optional"`
	KeepDays            int    `json:",optional"`
	StackCooldownMillis int    `json:",default=100"`
}
```


## Mode
**Mode** 定义了日志打印的方式。默认的模式是 **console**， 打印到控制台上面。

目前支持的模式如下：

- console
    -  打印到控制台
- file
    - 打印到指定路径下的access.log, error.log, stat.log等文件里
- volume
    - 为了在k8s内打印到mount进来的存储上，因为多个pod可能会覆盖相同的文件，volume模式自动识别pod并按照pod分开写各自的日志文件

## Path
**Path** 定义了文件日志的输出路径，默认值为 **logs**。

## Level
**Level** 定义了日志打印级别，默认值为 **info**。
目前支持的级别如下:

- info
- error
- severe



## Compress
**Compress** 定义了日志是否需要压缩，默认值为 **false**。在 Mode 为 file 模式下面，文件最后会进行打包压缩成 .gz 文件。


## KeepDays
**KeepDays** 定义日志最大保留天数，默认值为 0，表示不会删除旧的日志。在 Mode 为 file 模式下面，如果超过了最大保留天数，旧的日志文件将会被删除。


## StackCooldownMillis
**StackCooldownMillis** 定义了日志输出间隔，默认为 100 毫秒。

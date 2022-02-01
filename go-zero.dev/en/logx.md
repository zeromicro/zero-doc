# logx
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

## Example

```go
var c logx.LogConf
// Initialize the configuration from the yaml file
conf.MustLoad("config.yaml", &c)

// logx is initialized according to the configuration
logx.MustSetup(c)

logx.Info("This is info!")
logx.Infof("This is %s!", "info")

logx.Error("This is error!")
logx.Errorf("this is %s!", "error")

logx.Close()
```

## Initialization
logx has many configurable items, you can refer to the definition in logx.LogConf. Currently available

```go
logx.MustSetUp(c)
```
Perform the initial configuration. If the initial configuration is not performed, all the configurations will use the default configuration.

## Level
The print log levels supported by logx are:
- info
- error
- server
- fatal
- slow
- stat

You can use the corresponding method to print out the log of the corresponding level.
At the same time, in order to facilitate debugging and online use, the log printing level can be dynamically adjusted. The level can be set through **logx.SetLevel(uint32)** or through configuration initialization. The currently supported parameters are:

```go
const (
	// Print all levels of logs
	InfoLevel = iotas
	// Print errors, slows, stacks logs
	ErrorLevel
	// Only print server level logs
	SevereLevel
)
```

## Log mode
At present, the log printing mode is mainly divided into two types, one is file output, and the other is console output. The recommended way, when using k8s, docker and other deployment methods, you can output the log to the console, use the log collector to collect and import it to es for log analysis. If it is a direct deployment method, the file output method can be used, and logx will automatically create log files corresponding to 5 corresponding levels in the specified file directory to save the logs.

```bash
.
├── access.log
├── error.log
├── severe.log
├── slow.log
└── stat.log
```

At the same time, the file will be divided according to the natural day. When the specified number of days is exceeded, the log file will be automatically deleted, packaged and other operations.

## Disable log
If you don't need log printing, you can use **logx.Close()** to close the log output. Note that when log output is disabled, it cannot be opened again. For details, please refer to the implementation of **logx.RotateLogger** and **logx.DailyRotateRule**.

## Close log
Because logx uses asynchronous log output, if the log is not closed normally, some logs may be lost. The log output must be turned off where the program exits:
```go
logx.Close()
```
Log configuration and shutdown related operations have already been done in most places such as rest and zrpc in the framework, so users don't need to care.
At the same time, note that when the log output is turned off, the log cannot be printed again.

Recommended writing:
```go
import "github.com/zeromicro/go-zero/core/proc"

// grace close log
proc.AddShutdownListener(func() {
	logx.Close()
})
```

## Duration
When we print the log, we may need to print the time-consuming situation, we can use **logx.WithDuration(time.Duration)**, refer to the following example:

```go
startTime := timex.Now()
// Database query
rows, err := conn.Query(q, args...)
duration := timex.Since(startTime)
if duration > slowThreshold {
    logx.WithDuration(duration).Slowf("[SQL] query: slowcall - %s", stmt)
} else {
    logx.WithDuration(duration).Infof("sql query: %s", stmt)
}
```


Will output the following format:

```json
{"@timestamp":"2020-09-12T01:22:55.552+08","level":"info","duration":"3.0ms","content":"sql query:..."}
{"@timestamp":"2020-09-12T01:22:55.552+08","level":"slow","duration":"500ms","content":"[SQL] query: slowcall - ..."}
```

In this way, it is easy to collect statistics about slow sql related information.

## TraceLog
tracingEntry is customized for link tracing log output. You can print the traceId and spanId information in the context. With our **rest** and **zrpc**, it is easy to complete the related printing of the link log. The example is as follows:

```go
logx.WithContext(context.Context).Info("This is info!")
```


## SysLog

Some applications may use system log for log printing. Logx uses the same encapsulation method, which makes it easy to collect log-related logs into logx.

```go
logx.CollectSysLog()
```




# Log configuration related
**LogConf** Define the basic configuration required for the logging system

The complete definition is as follows:

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
**Mode** defines the log printing method. The default mode is **console**, which will print to the console.

The currently supported modes are as follows:

- console
    -  Print to the console
- file
    - Print to access.log, error.log, stat.log and other files in the specified path
- volume
    - In order to print to the storage that the mount comes in in k8s, because multiple pods may overwrite the same file, the volume mode automatically recognizes the pod and writes separate log files according to the pod.

## Path
**Path** defines the output path of the file log, the default value is **logs**.

## Level
**Level** defines the log printing level, and the default value is **info**.
The currently supported levels are as follows:

- info
- error
- severe



## Compress
**Compress** defines whether the log needs to be compressed, the default value is **false**. When Mode is file mode, the file will finally be packaged and compressed into a .gz file.


## KeepDays
**KeepDays** defines the maximum number of days to keep logs. The default value is 0, which means that old logs will not be deleted. When Mode is file mode, if the maximum retention days are exceeded, the old log files will be deleted.


## StackCooldownMillis
**StackCooldownMillis** defines the log output interval, the default is 100 milliseconds.

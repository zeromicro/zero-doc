# Model Generation
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)


First, after downloading the [demo project](https://go-zero.dev/en/resource/book.zip), we will use the user's model to demonstrate the code generation.

## Forward
Model is a bridge for services to access the persistent data layer. The persistent data of the business often exists in databases such as mysql and mongo. We all know that the operation of a database is nothing more than CURD.
And these tasks will also take up part of the time for development. I once wrote 40 model files when writing a business. According to the complexity of different business requirements, on average, each model file is almost required.
10 minutes, for 40 files, 400 minutes of working time, almost a day's workload, and the goctl tool can complete the 400 minutes of work in 10 seconds.

## Prepare
Enter the demo project `book`, find the` user.sql` file under `user/model`, and execute the table creation in your own database.

## Code generation (with cache)
### The way one(ddl)
Enter the `service/user/model` directory and execute the command
```shell
$ cd service/user/model
$ goctl model mysql ddl -src user.sql -dir . -c
```
```text
Done.
```

### The way two(datasource)
```shell
$ goctl model mysql datasource -url="$datasource" -table="user" -c -dir .
```
```text
Done.
```
> [!TIP]
> `$datasource` is the database connection address

### The way three(intellij plugin)
In Goland, right-click `user.sql`, enter and click `New`->`Go Zero`->`Model Code` to generate it, or open the `user.sql` file,
Enter the editing area, use the shortcut key `Command+N` (for macOS) or `alt+insert` (for windows), select `Mode Code`.

![model generation](https://zeromicro.github.io/go-zero-pages/resource/intellij-model.png)

> [!TIP]
> The intellij plug-in generation needs to install the goctl plug-in, see [intellij plugin](intellij.md) for details

## Verify the generated model file
view tree
```shell
$ tree
```
```text
.
├── user.sql
├── usermodel.go
└── vars.go
```

# Guess you wants
[Model Commands](goctl-model.md)

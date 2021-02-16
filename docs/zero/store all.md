# store

store 是 `go-zero` 数据持久化的集合包。在 `go-zero` 提供了 `Mysql, Mongo, redis, clickhouse` ，涉及传统的 `OLTP` 数据库， `nosql` 数据库，一级当下最新的 `OLAP` 数据库，提供一站式持久化方案。


以下列出 `store` 目前支持的持久化类型：


| **category** | **target** |
| --- | --- |
| clickhouse | clickhouse |
| kv | 通用 k-v 数据库 |
| mongo | mongoDB |
| mongoc | **带缓存操作**的mongo「无需多余的cache操作」 |
| postgres | postgresDB |
| redis | redis |
| sqlc | **带缓存操作**的 <sql> |
| sqlx | 通用 <sql> 操作 |


<Vssue title="storeall" />

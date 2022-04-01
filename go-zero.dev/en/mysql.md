# Mysql
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

`go-zero` provides easier operation of `mysql` API.

> [!TIP]
> But `stores/mysql` positioning is not an `orm` framework. If you need to generate `model` layer code through `sql/scheme` -> `model/struct` reverse engineering, developers can use [goctl model](https://go-zero.dev/cn/goctl-model.html), this is an excellent feature.



## Features

- Provides a more developer-friendly API compared to native
- Complete the automatic assignment of `queryField -> struct`
- Insert "bulkinserter" in batches
- Comes with fuse
- API has been continuously tested by several services
- Provide `partial assignment` feature, do not force strict assignment of `struct`



## Connection
Let's use an example to briefly explain how to create a `mysql` connected model:
```go
// 1. Quickly connect to a mysql
// datasource: mysql dsn
heraMysql := sqlx.NewMysql(datasource)

// 2. Call in the `servicecontext`, understand the logic layer call of the model upper layer
model.NewMysqlModel(heraMysql, tablename),

// 3. model layer mysql operation
func NewMysqlModel(conn sqlx.SqlConn, table string) *MysqlModel {
	defer func() {
		recover()
	}()
    // 4. Create a batch insert [mysql executor]
    // conn: mysql connection; insertsql: mysql insert sql
	bulkInserter , err := sqlx.NewBulkInserter(conn, insertsql)
	if err != nil {
		logx.Error("Init bulkInsert Faild")
		panic("Init bulkInsert Faild")
		return nil
	}
	return &MysqlModel{conn: conn, table: table, Bulk: bulkInserter}
}
```


## CRUD

Prepare an `User model`
```go
var userBuilderQueryRows = strings.Join(builder.FieldNames(&User{}), ",")

type User struct {
    Avatar string `db:"avatar"`
    UserName string `db:"user_name"`
    Sex int `db:"sex"`
    MobilePhone string `db:"mobile_phone"`
}
```
Among them, `userBuilderQueryRows`: `go-zero` provides `struct -> [field...]` conversion. Developers can use this as a template directly.
### insert
```go
// An actual insert model layer operation
func (um *UserModel) Insert(user *User) (int64, error) {
    const insertsql = `insert into `+um.table+` (`+userBuilderQueryRows+`) values(?, ?, ?)`
    // insert op
    res, err := um.conn.Exec(insertsql, user.Avatar, user.UserName, user.Sex, user.MobilePhone)
    if err != nil {
        logx.Errorf("insert User Position Model Model err, err=%v", err)
        return -1, err
    }
    id, err := res.LastInsertId()
    if err != nil {
        logx.Errorf("insert User Model to Id  parse id err,err=%v", err)
        return -1, err
    }
    return id, nil
}
```

- Splicing `insertsql`
- Pass in `insertsql` and the `struct field` corresponding to the placeholder -> `con.Exex(insertsql, field...)`


> [!WARNING]
> `conn.Exec(sql, args...)`: `args...` needs to correspond to the placeholder in `sql`. Otherwise, there will be problems with assignment exceptions.


`go-zero` unified and abstracted operations involving `mysql` modification as `Exec()`. So the `insert/update/delete` operations are essentially the same. For the remaining two operations, the developer can try the above `insert` process.


### query


You only need to pass in the `querysql` and `model` structure, and you can get the assigned `model`. No need for developers to manually assign values.
```go
func (um *UserModel) FindOne(uid int64) (*User, error) {
    var user User
    const querysql = `select `+userBuilderQueryRows+` from `+um.table+` where id=? limit 1`
    err := um.conn.QueryRow(&user, querysql, uid)
    if err != nil {
        logx.Errorf("userId.findOne error, id=%d, err=%s", uid, err.Error())
        if err == sqlx.ErrNotFound {
            return nil, ErrNotFound
        }
        return nil, err
    }
    return &user, nil
}
```

- Declare `model struct`, splicing `querysql`
- `conn.QueryRow(&model, querysql, args...)`: `args...` corresponds to the placeholder in `querysql`.



> [!WARNING]
> The first parameter in `QueryRow()` needs to be passed in `Ptr` "The bottom layer needs to be reflected to assign a value to `struct`"

The above is to query one record, if you need to query multiple records, you can use `conn.QueryRows()`
```go
func (um *UserModel) FindOne(sex int) ([]*User, error) {
    users := make([]*User, 0)
    const querysql = `select `+userBuilderQueryRows+` from `+um.table+` where sex=?`
    err := um.conn.QueryRows(&users, querysql, sex)
    if err != nil {
        logx.Errorf("usersSex.findOne error, sex=%d, err=%s", uid, err.Error())
        if err == sqlx.ErrNotFound {
            return nil, ErrNotFound
        }
        return nil, err
    }
    return users, nil
}
```
The difference from `QueryRow()` is: `model` needs to be set to `Slice`, because it is to query multiple rows, and multiple `model`s need to be assigned. But at the same time you need to pay attention to ️: the first parameter needs to be passed in `Ptr`

### querypartial


In terms of use, it is no different from the above-mentioned `QueryRow()`, "this reflects the highly abstract design of `go-zero`."


the difference:

- `QueryRow()`: `len(querysql fields) == len(struct)`, and one-to-one correspondence
- `QueryRowPartial()` ：`len(querysql fields) <= len(struct)`



numA: Number of database fields; numB: the number of defined `struct` attributes.
If `numA <numB`, but you just need to unify multiple queries, "multiple `struct` is defined to return different purposes, and all of them can use the same `querysql`", you can use `QueryRowPartial() `


## Transaction


To perform a series of operations in a transaction, the general process is as follows:
```go
var insertsql = `insert into User(uid, username, mobilephone) values (?, ?, ?)`
err := usermodel.conn.Transact(func(session sqlx.Session) error {
    stmt, err := session.Prepare(insertsql)
    if err != nil {
        return err
    }
    defer stmt.Close()

    // Any error returned will roll back the transaction
    if _, err := stmt.Exec(uid, username, mobilephone); err != nil {
        logx.Errorf("insert userinfo stmt exec: %s", err)
        return err
    }

    // You can also continue to perform insert/update/delete related operations
    return nil
})
```
As in the above example, developers only need to wrap all operations in **transaction** in a function `func(session sqlx.Session) error {}`, if the operation in the transaction returns any error, `Transact( )` will automatically roll back the transaction.

## Distributed transactions

go-zero has deeply cooperated with [dtm](https://github.com/dtm-labs/dtm) and has natively supported distributed transactions, see [distributed-transaction](distributed-transaction.md) for details
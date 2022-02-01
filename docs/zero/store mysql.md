# mysql

`go-zero` 提供更易于操作 `mysql` API。


> 但是  `stores/mysql` 定位不是一个 `orm` 框架，如果你需要通过 `sql/scheme` -> `model/struct` 逆向生成 `model` 层代码，开发者可以使用「[goctl model](https://www.yuque.com/tal-tech/go-zero/nkg20f)」，这个是极好的功能。



## Feature


- 相比原生，提供开发者更友好的API
- 完成 `queryField -> struct` 的自动赋值
- 批量插入「bulkinserter」
- 自带熔断
- API 经过若干个服务的不断考验
- 提供 `partial assignment` 特性，不强制 `struct` 的严格赋值



## Connection
下面用一个例子简单说明一下如何创建一个 `mysql` 连接的model：
```go
// 1. 快速连接一个 mysql
// datasource: mysql dsn
heraMysql := sqlx.NewMysql(datasource)

// 2. 在 servicecontext 中调用，懂model上层的logic层调用
model.NewMysqlModel(heraMysql, tablename),

// 3. model层 mysql operation
func NewMysqlModel(conn sqlx.SqlConn, table string) *MysqlModel {
	defer func() {
		recover()
	}()
    // 4. 创建一个批量insert的 [mysql executor]
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


准备一个 `User model` 
```go
var userBuilderQueryRows = strings.Join(builder.FieldNames(&User{}), ",")

type User struct {
    Avatar string `db:"avatar"` 			// 头像
    UserName string `db:"user_name"` 		// 姓名
    Sex int `db:"sex"` 						// 1男,2女
    MobilePhone string `db:"mobile_phone"` 	// 手机号
}
```
其中 `userBuilderQueryRows` ： `go-zero` 中提供 `struct -> [field...]` 的转化，开发者可以将此当成模版直接使用。
### insert
```go
// 一个实际的insert model层操作
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

- 拼接 `insertsql` 
- 将 `insertsql` 以及 占位符对应的 `struct field` 传入 -> `con.Exex(insertsql, field...)` 



需要 ⚠️  `conn.Exec(sql, args...)` ： `args...` 需对应 `sql` 中占位符。不然会出现赋值异常的问题。


`go-zero` 将涉及 `mysql` 修改的操作统一抽象为 `Exec()` 。所以 `insert/update/delete` 操作本质上一致的。其余两个操作，开发者按照上述 `insert` 流程尝试即可。


### query


只需要传入 `querysql` 和 `model` 结构体，就可以获取到被赋值好的 `model` 。无需开发者手动赋值。
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

- 声明 `model struct` ，拼接 `querysql` 
- `conn.QueryRow(&model, querysql, args...)` ： `args...` 与 `querysql` 中的占位符对应。



需要 ⚠️ 的是： `QueryRow()` 中第一个参数需要传入 `Ptr` 「底层需要反射对 `struct` 进行赋值」

上述是查询一条记录，如果需要查询多条记录时，可以使用 `conn.QueryRows()` 
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
与 `QueryRow()` 不同的地方在于： `model` 需要设置成 `Slice` ，因为是查询多行，需要对多个 `model` 赋值。但同时需要 ⚠️：第一个参数需要传入 `Ptr` 

### querypartial


从使用上，与上述的 `QueryRow()` 无异「这正体现了 `go-zero` 高度的抽象设计」。


区别：

- `QueryRow()` ： `len(querysql fields) == len(struct)` ，且一一对应
- `QueryRowPartial()` ：`len(querysql fields) <= len(struct)`



numA：数据库字段数；numB：定义的 `struct` 属性数。
如果 `numA < numB` ，但是你恰恰又需要统一多处的查询时「定义了多个 `struct` 返回不同的用途，恰恰都可以使用相同的 `querysql` 」，就可以使用 `QueryRowPartial()`


## 事务


要在事务中执行一系列操作，一般流程如下：
```go
var insertsql = `insert into User(uid, username, mobilephone) values (?, ?, ?)`
err := usermodel.conn.Transact(func(session sqlx.Session) error {
    stmt, err := session.Prepare(insertsql)
    if err != nil {
        return err
    }
    defer stmt.Close()
    
    // 返回任何错误都会回滚事务
    if _, err := stmt.Exec(uid, username, mobilephone); err != nil {
        logx.Errorf("insert userinfo stmt exec: %s", err)
        return err
    }
    
    // 还可以继续执行 insert/update/delete 相关操作
    return nil
})
```
如同上述例子，开发者只需将 **事务** 中的操作都包装在一个函数 `func(session sqlx.Session) error {}` 中即可，如果事务中的操作返回任何错误， `Transact()` 都会自动回滚事务。


<Vssue title="storemysql" />

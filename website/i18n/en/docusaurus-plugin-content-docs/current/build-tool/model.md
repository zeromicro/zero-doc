---
sidebar_position: 4
---

# Build Model

`goctl model` is one of the components of the tools module under `go-zero`, which currently supports recognizing `mysql ddl` for `model` layer code generation, and can optionally generate code logic with or without `redis cache` via the command line or the `idea` plugin (to be supported soon).

## Quick start

* Generated via ddl

```shell
$ goctl model mysql ddl -src="./*.sql" -dir="./sql/model" -c
```

The CURD code can be generated quickly after executing the above command.

```text
model
│   ├── error.go
│   └── usermodel.go
```

* Generated via datasource

```shell
$ goctl model mysql datasource -url="user:password@tcp(127.0.0.1:3306)/database" -table="*"  -dir="./model"
```

* Example of generating code

```go
    package model
    
    import (
        "database/sql"
        "fmt"
        "strings"
        "time"
    
        "github.com/zeromicro/go-zero/core/stores/builder"
        "github.com/zeromicro/go-zero/core/stores/cache"
        "github.com/zeromicro/go-zero/core/stores/sqlc"
        "github.com/zeromicro/go-zero/core/stores/sqlx"
        "github.com/zeromicro/go-zero/core/stringx"
    )
    
    var (
        userFieldNames          = builder.RawFieldNames(&User{})
        userRows                = strings.Join(userFieldNames, ",")
        userRowsExpectAutoSet   = strings.Join(stringx.Remove(userFieldNames, "`id`", "`create_time`", "`update_time`"), ",")
        userRowsWithPlaceHolder = strings.Join(stringx.Remove(userFieldNames, "`id`", "`create_time`", "`update_time`"), "=?,") + "=?"
    
        cacheUserNamePrefix   = "cache#User#name#"
        cacheUserMobilePrefix = "cache#User#mobile#"
        cacheUserIdPrefix     = "cache#User#id#"
        cacheUserPrefix       = "cache#User#user#"
    )
    
    type (
        UserModel interface {
            Insert(data User) (sql.Result, error)
            FindOne(id int64) (*User, error)
            FindOneByUser(user string) (*User, error)
            FindOneByName(name string) (*User, error)
            FindOneByMobile(mobile string) (*User, error)
            Update(data User) error
            Delete(id int64) error
        }
    
        defaultUserModel struct {
            sqlc.CachedConn
            table string
        }
    
        User struct {
            Id         int64     `db:"id"`
            User       string    `db:"user"`     // 用户
            Name       string    `db:"name"`     // 用户名称
            Password   string    `db:"password"` // 用户密码
            Mobile     string    `db:"mobile"`   // 手机号
            Gender     string    `db:"gender"`   // 男｜女｜未公开
            Nickname   string    `db:"nickname"` // 用户昵称
            CreateTime time.Time `db:"create_time"`
            UpdateTime time.Time `db:"update_time"`
        }
    )
    
    func NewUserModel(conn sqlx.SqlConn, c cache.CacheConf) UserModel {
        return &defaultUserModel{
            CachedConn: sqlc.NewConn(conn, c),
            table:      "`user`",
        }
    }
    
    func (m *defaultUserModel) Insert(data User) (sql.Result, error) {
        userNameKey := fmt.Sprintf("%s%v", cacheUserNamePrefix, data.Name)
        userMobileKey := fmt.Sprintf("%s%v", cacheUserMobilePrefix, data.Mobile)
        userKey := fmt.Sprintf("%s%v", cacheUserPrefix, data.User)
        ret, err := m.Exec(func(conn sqlx.SqlConn) (result sql.Result, err error) {
            query := fmt.Sprintf("insert into %s (%s) values (?, ?, ?, ?, ?, ?)", m.table, userRowsExpectAutoSet)
            return conn.Exec(query, data.User, data.Name, data.Password, data.Mobile, data.Gender, data.Nickname)
        }, userNameKey, userMobileKey, userKey)
        return ret, err
    }
    
    func (m *defaultUserModel) FindOne(id int64) (*User, error) {
        userIdKey := fmt.Sprintf("%s%v", cacheUserIdPrefix, id)
        var resp User
        err := m.QueryRow(&resp, userIdKey, func(conn sqlx.SqlConn, v interface{}) error {
            query := fmt.Sprintf("select %s from %s where `id` = ? limit 1", userRows, m.table)
            return conn.QueryRow(v, query, id)
        })
        switch err {
        case nil:
            return &resp, nil
        case sqlc.ErrNotFound:
            return nil, ErrNotFound
        default:
            return nil, err
        }
    }
    
    func (m *defaultUserModel) FindOneByUser(user string) (*User, error) {
        userKey := fmt.Sprintf("%s%v", cacheUserPrefix, user)
        var resp User
        err := m.QueryRowIndex(&resp, userKey, m.formatPrimary, func(conn sqlx.SqlConn, v interface{}) (i interface{}, e error) {
            query := fmt.Sprintf("select %s from %s where `user` = ? limit 1", userRows, m.table)
            if err := conn.QueryRow(&resp, query, user); err != nil {
                return nil, err
            }
            return resp.Id, nil
        }, m.queryPrimary)
        switch err {
        case nil:
            return &resp, nil
        case sqlc.ErrNotFound:
            return nil, ErrNotFound
        default:
            return nil, err
        }
    }
    
    func (m *defaultUserModel) FindOneByName(name string) (*User, error) {
        userNameKey := fmt.Sprintf("%s%v", cacheUserNamePrefix, name)
        var resp User
        err := m.QueryRowIndex(&resp, userNameKey, m.formatPrimary, func(conn sqlx.SqlConn, v interface{}) (i interface{}, e error) {
            query := fmt.Sprintf("select %s from %s where `name` = ? limit 1", userRows, m.table)
            if err := conn.QueryRow(&resp, query, name); err != nil {
                return nil, err
            }
            return resp.Id, nil
        }, m.queryPrimary)
        switch err {
        case nil:
            return &resp, nil
        case sqlc.ErrNotFound:
            return nil, ErrNotFound
        default:
            return nil, err
        }
    }
    
    func (m *defaultUserModel) FindOneByMobile(mobile string) (*User, error) {
        userMobileKey := fmt.Sprintf("%s%v", cacheUserMobilePrefix, mobile)
        var resp User
        err := m.QueryRowIndex(&resp, userMobileKey, m.formatPrimary, func(conn sqlx.SqlConn, v interface{}) (i interface{}, e error) {
            query := fmt.Sprintf("select %s from %s where `mobile` = ? limit 1", userRows, m.table)
            if err := conn.QueryRow(&resp, query, mobile); err != nil {
                return nil, err
            }
            return resp.Id, nil
        }, m.queryPrimary)
        switch err {
        case nil:
            return &resp, nil
        case sqlc.ErrNotFound:
            return nil, ErrNotFound
        default:
            return nil, err
        }
    }
    
    func (m *defaultUserModel) Update(data User) error {
        userIdKey := fmt.Sprintf("%s%v", cacheUserIdPrefix, data.Id)
        _, err := m.Exec(func(conn sqlx.SqlConn) (result sql.Result, err error) {
            query := fmt.Sprintf("update %s set %s where `id` = ?", m.table, userRowsWithPlaceHolder)
            return conn.Exec(query, data.User, data.Name, data.Password, data.Mobile, data.Gender, data.Nickname, data.Id)
        }, userIdKey)
        return err
    }
    
    func (m *defaultUserModel) Delete(id int64) error {
        data, err := m.FindOne(id)
        if err != nil {
            return err
        }
    
        userNameKey := fmt.Sprintf("%s%v", cacheUserNamePrefix, data.Name)
        userMobileKey := fmt.Sprintf("%s%v", cacheUserMobilePrefix, data.Mobile)
        userIdKey := fmt.Sprintf("%s%v", cacheUserIdPrefix, id)
        userKey := fmt.Sprintf("%s%v", cacheUserPrefix, data.User)
        _, err = m.Exec(func(conn sqlx.SqlConn) (result sql.Result, err error) {
            query := fmt.Sprintf("delete from %s where `id` = ?", m.table)
            return conn.Exec(query, id)
        }, userNameKey, userMobileKey, userIdKey, userKey)
        return err
    }
    
    func (m *defaultUserModel) formatPrimary(primary interface{}) string {
        return fmt.Sprintf("%s%v", cacheUserIdPrefix, primary)
    }
    
    func (m *defaultUserModel) queryPrimary(conn sqlx.SqlConn, v, primary interface{}) error {
        query := fmt.Sprintf("select %s from %s where `id` = ? limit 1", userRows, m.table)
        return conn.QueryRow(v, query, primary)
    }
    
```

## Usage

```text
$ goctl model mysql -h
```

```text
NAME:
   goctl model mysql - generate mysql model"

USAGE:
   goctl model mysql command [command options] [arguments...]

COMMANDS:
   ddl         generate mysql model from ddl"
   datasource  generate model from datasource"

OPTIONS:
   --help, -h  show help
```

## Generate rules

* Default Rules

  By default users create createTime, updateTime fields (ignore case, underscore naming style) and the default value is `CURRENT_TIMESTAMP`, while updateTime supports `ON UPDATE CURRENT_TIMESTAMP`, for these two fields generate `insert`, `update` will be removed from the assignment, of course, if you do not need these two fields then it does not matter.
* With cache mode

* ddl

      ```shell
      $ goctl model mysql -src={patterns} -dir={dir} -cache
      ```

      help

      ```
      NAME:
         goctl model mysql ddl - generate mysql model from ddl
      
      USAGE:
         goctl model mysql ddl [command options] [arguments...]
      
      OPTIONS:
         --src value, -s value  the path or path globbing patterns of the ddl
         --dir value, -d value  the target dir
         --style value          the file naming format, see [https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]
         --cache, -c            generate code with cache [optional]
         --idea                 for idea plugin [optional]
      ```

    * datasource

      ```shell
      $ goctl model mysql datasource -url={datasource} -table={patterns}  -dir={dir} -cache=true
      ```

      help

      ```text
      NAME:
         goctl model mysql datasource - generate model from datasource
      
      USAGE:
         goctl model mysql datasource [command options] [arguments...]
      
      OPTIONS:
         --url value              the data source of database,like "root:password@tcp(127.0.0.1:3306)/database
         --table value, -t value  the table or table globbing patterns in the database
         --cache, -c              generate code with cache [optional]
         --dir value, -d value    the target dir
         --style value            the file naming format, see [https://github.com/zeromicro/go-zero/tree/master/tools/goctl/config/readme.md]
         --idea                   for idea plugin [optional]
      ```

:::tip
goctl model mysql ddl/datasource both have a new `--style` parameter to mark the file naming style.
::: 

Currently only support redis cache, if you choose to bring cache mode, that is, the generated `FindOne(ByXxx)` & `Delete` code will generate code with cache logic, currently only support single index fields (in addition to full-text indexes), for the joint index we do not think by default need to bring cache, and does not belong to the general code, so not put in the code generation ranks, such as example in the user table `id`, `name`, `mobile` fields belong to the single field index.

* Without cache mode

* ddl

        ```shell
        $  goctl model -src={patterns} -dir={dir}
        ```

    * datasource

        ```shell
        $  goctl model mysql datasource -url={datasource} -table={patterns}  -dir={dir}
        ```

  or
    * ddl

        ```shell
        $  goctl model -src={patterns} -dir={dir}
        ```

    * datasource

        ```shell
        $  goctl model mysql datasource -url={datasource} -table={patterns}  -dir={dir}
        ```
      
Generate code with only basic CURD structure.

## Cache

For the cache piece I chose to list it in the form of a question and answer. I think this will give a clearer description of the functions of the cache in the mod.

* What information does the cache cache?
    
    For primary key field caching, the entire structure information is cached, while for single index fields (except full-text indexes) the primary key field values are cached.
    
* Will the cache be cleared if the data is updated (`update`)?

    will, but only clear the primary key cache information, WHY?
    
* Why not generate code for `updateByXxx` and `deleteByXxx` as per single index field?

    Theoretically there is no problem, but we believe that the data operations for the model layer are all in the whole structure, including the query, I do not recommend querying only a certain part of the fields (no objection), otherwise our cache will be meaningless.
    
* Why not support `findPageLimit`, `findAll` so mode code generation layer?

     Currently, I think all the code except the basic CURD is <i>business-type</i> code, which I think is better for developers to write according to business needs.
     
 # Type conversion rules
 | mysql dataType | golang dataType | golang dataType(if null&&default null) |
 |----------------|-----------------|----------------------------------------|
 | bool           | int64           | sql.NullInt64                          |
 | boolean        | int64           | sql.NullInt64                          |
 | tinyint        | int64           | sql.NullInt64                          |
 | smallint       | int64           | sql.NullInt64                          |
 | mediumint      | int64           | sql.NullInt64                          |
 | int            | int64           | sql.NullInt64                          |
 | integer        | int64           | sql.NullInt64                          |
 | bigint         | int64           | sql.NullInt64                          |
 | float          | float64         | sql.NullFloat64                        |
 | double         | float64         | sql.NullFloat64                        |
 | decimal        | float64         | sql.NullFloat64                        |
 | date           | time.Time       | sql.NullTime                           |
 | datetime       | time.Time       | sql.NullTime                           |
 | timestamp      | time.Time       | sql.NullTime                           |
 | time           | string          | sql.NullString                         |
 | year           | time.Time       | sql.NullInt64                          |
 | char           | string          | sql.NullString                         |
 | varchar        | string          | sql.NullString                         |
 | binary         | string          | sql.NullString                         |
 | varbinary      | string          | sql.NullString                         |
 | tinytext       | string          | sql.NullString                         |
 | text           | string          | sql.NullString                         |
 | mediumtext     | string          | sql.NullString                         |
 | longtext       | string          | sql.NullString                         |
 | enum           | string          | sql.NullString                         |
 | set            | string          | sql.NullString                         |
 | json           | string          | sql.NullString                         |



      


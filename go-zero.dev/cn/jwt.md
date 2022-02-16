# jwt鉴权

## 概述
> JSON Web令牌（JWT）是一个开放标准（RFC 7519），它定义了一种紧凑而独立的方法，用于在各方之间安全地将信息作为JSON对象传输。由于此信息是经过数字签名的，因此可以被验证和信任。可以使用秘密（使用HMAC算法）或使用RSA或ECDSA的公钥/私钥对对JWT进行签名。

## 什么时候应该使用JWT
* 授权：这是使用JWT的最常见方案。一旦用户登录，每个后续请求将包括JWT，从而允许用户访问该令牌允许的路由，服务和资源。单一登录是当今广泛使用JWT的一项功能，因为它的开销很小并且可以在不同的域中轻松使用。

* 信息交换：JSON Web令牌是在各方之间安全地传输信息的一种好方法。因为可以对JWT进行签名（例如，使用公钥/私钥对），所以您可以确保发件人是他们所说的人。此外，由于签名是使用标头和有效负载计算的，因此您还可以验证内容是否未被篡改。

## 为什么要使用JSON Web令牌
由于JSON不如XML冗长，因此在编码时JSON的大小也较小，从而使JWT比SAML更为紧凑。这使得JWT是在HTML和HTTP环境中传递的不错的选择。

在安全方面，只能使用HMAC算法由共享机密对SWT进行对称签名。但是，JWT和SAML令牌可以使用X.509证书形式的公用/专用密钥对进行签名。与签署JSON的简单性相比，使用XML Digital Signature签署XML而不引入模糊的安全漏洞是非常困难的。

JSON解析器在大多数编程语言中都很常见，因为它们直接映射到对象。相反，XML没有自然的文档到对象的映射。与SAML断言相比，这使使用JWT更加容易。

关于用法，JWT是在Internet规模上使用的。这突显了在多个平台（尤其是移动平台）上对JSON Web令牌进行客户端处理的简便性。

> [!TIP]
> 以上内容全部来自[jwt官网介绍](https://jwt.io/introduction)

## go-zero中怎么使用jwt
jwt鉴权一般在api层使用，我们这次演示工程中分别在user api登录时生成jwt token，在search api查询图书时验证用户jwt token两步来实现。

### user api生成jwt token
接着[业务编码](business-coding.md)章节的内容，我们完善上一节遗留的`getJwtToken`方法，即生成jwt token逻辑

#### 添加配置定义和yaml配置项
```shell
$ vim service/user/api/internal/config/config.go
```
```go
type Config struct {
	rest.RestConf
	Mysql struct{
		DataSource string
	}
	CacheRedis cache.CacheConf
	Auth      struct {
		AccessSecret string
		AccessExpire int64
	}
}
```
```shell
$ vim service/user/api/etc/user-api.yaml
```
```yaml
Name: user-api
Host: 0.0.0.0
Port: 8888
Mysql:
  DataSource: $user:$password@tcp($url)/$db?charset=utf8mb4&parseTime=true&loc=Asia%2FShanghai
CacheRedis:
  - Host: $host
    Pass: $pass
    Type: node
Auth:
  AccessSecret: $AccessSecret
  AccessExpire: $AccessExpire
```

> [!TIP]
> $AccessSecret：生成jwt token的密钥，最简单的方式可以使用一个uuid值。
> 
> $AccessExpire：jwt token有效期，单位：秒
> 
> 更多配置信息，请参考[api配置介绍](api-config.md)

```shell
$ vim service/user/api/internal/logic/loginlogic.go
```

```go
func (l *LoginLogic) getJwtToken(secretKey string, iat, seconds, userId int64) (string, error) {
  claims := make(jwt.MapClaims)
  claims["exp"] = iat + seconds
  claims["iat"] = iat
  claims["userId"] = userId
  token := jwt.New(jwt.SigningMethodHS256)
  token.Claims = claims
  return token.SignedString([]byte(secretKey))
}
```

### search api使用jwt token鉴权
#### 编写search.api文件
```shell
$ vim service/search/api/search.api
```
```text
type (
    SearchReq {
        // 图书名称
        Name string `form:"name"`
    }

    SearchReply {
        Name string `json:"name"`
        Count int `json:"count"`
    }
)

@server(
    jwt: Auth
)
service search-api {
    @handler search
    get /search/do (SearchReq) returns (SearchReply)
}

service search-api {
    @handler ping
    get /search/ping
}
```

> [!TIP]
> `jwt: Auth`：开启jwt鉴权
> 
> 如果路由需要jwt鉴权，则需要在service上方声明此语法标志，如上文中的` /search/do`
> 
> 不需要jwt鉴权的路由就无需声明，如上文中`/search/ping`
> 
> 更多语法请阅读[api语法介绍](api-grammar.md)


#### 生成代码
前面已经描述过有三种方式去生成代码，这里就不赘述了。


#### 添加yaml配置项
```shell
$ vim service/search/api/etc/search-api.yaml
```
```yaml
Name: search-api
Host: 0.0.0.0
Port: 8889
Auth:
  AccessSecret: $AccessSecret
  AccessExpire: $AccessExpire

```

> [!TIP]
> $AccessSecret：这个值必须要和user api中声明的一致。
> 
> $AccessExpire: 有效期
> 
> 这里修改一下端口，避免和user api端口8888冲突

### 验证 jwt token
* 启动user api服务，登录
    ```shell
    $ cd service/user/api
    $ go run user.go -f etc/user-api.yaml
    ```
    ```text
    Starting server at 0.0.0.0:8888...
    ```
    ```shell
    $ curl -i -X POST \
      http://127.0.0.1:8888/user/login \
      -H 'Content-Type: application/json' \
      -d '{
        "username":"666",
        "password":"123456"
    }'
    ```
    ```text
    HTTP/1.1 200 OK
    Content-Type: application/json
    Date: Mon, 08 Feb 2021 10:37:54 GMT
    Content-Length: 251
    
    {"id":1,"name":"小明","gender":"男","accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MTI4NjcwNzQsImlhdCI6MTYxMjc4MDY3NCwidXNlcklkIjoxfQ.JKa83g9BlEW84IiCXFGwP2aSd0xF3tMnxrOzVebbt80","accessExpire":1612867074,"refreshAfter":1612823874}
    ```
* 启动search api服务，调用`/search/do`验证jwt鉴权是否通过
    ```shell
    $ go run search.go -f etc/search-api.yaml
    ```
    ```text
    Starting server at 0.0.0.0:8889...
    ```
    我们先不传jwt token，看看结果
    ```shell
    $ curl -i -X GET \
      'http://127.0.0.1:8889/search/do?name=%E8%A5%BF%E6%B8%B8%E8%AE%B0'
    ```
    ```text
    HTTP/1.1 401 Unauthorized
    Date: Mon, 08 Feb 2021 10:41:57 GMT
    Content-Length: 0
    ```
    很明显，jwt鉴权失败了，返回401的statusCode，接下来我们带一下jwt token（即用户登录返回的`accessToken`）
    ```shell
    $ curl -i -X GET \
      'http://127.0.0.1:8889/search/do?name=%E8%A5%BF%E6%B8%B8%E8%AE%B0' \
      -H 'Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MTI4NjcwNzQsImlhdCI6MTYxMjc4MDY3NCwidXNlcklkIjoxfQ.JKa83g9BlEW84IiCXFGwP2aSd0xF3tMnxrOzVebbt80'
    ```
    ```text
    HTTP/1.1 200 OK
    Content-Type: application/json
    Date: Mon, 08 Feb 2021 10:44:45 GMT
    Content-Length: 21

    {"name":"","count":0}
    ```

    > [!TIP]
    > 服务启动错误，请查看[常见错误处理](error.md)


至此，jwt从生成到使用就演示完成了，jwt token的鉴权是go-zero内部已经封装了，你只需在api文件中定义服务时简单的声明一下即可。

### 获取jwt token中携带的信息
go-zero从jwt token解析后会将用户生成token时传入的kv原封不动的放在http.Request的Context中，因此我们可以通过Context就可以拿到你想要的值
```shell
$ vim /service/search/api/internal/logic/searchlogic.go
```
添加一个log来输出从jwt解析出来的userId。
```go
func (l *SearchLogic) Search(req types.SearchReq) (*types.SearchReply, error) {
	logx.Infof("userId: %v",l.ctx.Value("userId"))// 这里的key和生成jwt token时传入的key一致
	return &types.SearchReply{}, nil
}
```
运行结果
```text
{"@timestamp":"2021-02-09T10:29:09.399+08","level":"info","content":"userId: 1"}
```

# 猜你想看
* [jwt介绍](https://jwt.io/)
* [api配置介绍](api-config.md)
* [api语法](api-grammar.md)

# JWT authentication
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

## Summary
> JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and independent method for securely transmitting information as JSON objects between parties. Since this information is digitally signed, it can be verified and trusted. The JWT can be signed using a secret (using the HMAC algorithm) or using a public/private key pair of RSA or ECDSA.

## When should you use JSON Web Tokens?
* Authorization: This is the most common scenario for using JWT. Once the user is logged in, each subsequent request will include the JWT, allowing the user to access routes, services, and resources that are permitted with that token. Single Sign On is a feature that widely uses JWT nowadays, because of its small overhead and its ability to be easily used across different domains.

* Information exchange: JSON Web Tokens are a good way of securely transmitting information between parties. Because JWTs can be signed—for example, using public/private key pairs—you can be sure the senders are who they say they are. Additionally, as the signature is calculated using the header and the payload, you can also verify that the content hasn't been tampered with.

## Why should we use JSON Web Tokens?
As JSON is less verbose than XML, when it is encoded its size is also smaller, making JWT more compact than SAML. This makes JWT a good choice to be passed in HTML and HTTP environments.

Security-wise, SWT can only be symmetrically signed by a shared secret using the HMAC algorithm. However, JWT and SAML tokens can use a public/private key pair in the form of a X.509 certificate for signing. Signing XML with XML Digital Signature without introducing obscure security holes is very difficult when compared to the simplicity of signing JSON.

JSON parsers are common in most programming languages because they map directly to objects. Conversely, XML doesn't have a natural document-to-object mapping. This makes it easier to work with JWT than SAML assertions.

Regarding usage, JWT is used at Internet scale. This highlights the ease of client-side processing of the JSON Web token on multiple platforms, especially mobile.

> [!TIP]
> All the above content quote from [jwt.io](https://jwt.io/introduction)

## How to use jwt in go-zero
Jwt authentication is generally used at the api layer. In this demonstration project, we generate jwt token when user api logs in, and verify the user jwt token when searching api for books.

### user api generates jwt token
Following the content of the [Business Coding](business-coding.md) chapter, we perfect the `getJwtToken` method left over from the previous section, that is, generate the jwt token logic

#### Add configuration definition and yaml configuration items
```shell
$ vim service/user/cmd/api/internal/config/config.go
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
$ vim service/user/cmd/api/etc/user-api.yaml
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
> $AccessSecret: The easiest way to generate the key of the jwt token is to use an uuid value.
> 
> $AccessExpire: Jwt token validity period, unit: second
> 
> For more configuration information, please refer to [API Configuration](api-config.md)

```shell
$ vim service/user/cmd/api/internal/logic/loginlogic.go
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

### search.api uses jwt token authentication
#### Write search.api file
```shell
$ vim service/search/cmd/api/search.api
```
```text
type (
    SearchReq {
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
> `jwt: Auth`: Enable jwt authentication
> 
> If the routing requires JWT authentication, you need to declare this syntax flag above the service, such as `/search/do` above
> 
> Routes that do not require jwt authentication do not need to be declared, such as `/search/ping` above
> 
> For more grammar, please read [API IDL](api-grammar.md)


#### Generate code
As described above, there are three ways to generate code, so I won’t go into details here.


#### Add yaml configuration items
```shell
$ vim service/search/cmd/api/etc/search-api.yaml
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
> $AccessSecret: This value must be consistent with the one declared in the user api.
> 
> $AccessExpire: Valid period
> 
> Modify the port here to avoid conflicts with user api port 8888

### Verify jwt token
* Start user api service, and login
    ```shell
    $ cd service/user/cmd/api
    $ go run user.go -f etc/user-api.yaml
    ```
    ```text
    Starting server at 0.0.0.0:8888...
    ```
    ```shell
    $ curl -i -X POST \
      http://127.0.0.1:8888/user/login \
      -H 'content-type: application/json' \
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
    
    {"id":1,"name":"xiaoming","gender":"male","accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MTI4NjcwNzQsImlhdCI6MTYxMjc4MDY3NCwidXNlcklkIjoxfQ.JKa83g9BlEW84IiCXFGwP2aSd0xF3tMnxrOzVebbt80","accessExpire":1612867074,"refreshAfter":1612823874}
    ```
* Start the search api service, call `/search/do` to verify whether the jwt authentication is passed
    ```shell
    $ go run search.go -f etc/search-api.yaml
    ```
    ```text
    Starting server at 0.0.0.0:8889...
    ```
  Let’s not pass the jwt token and see the result:
    ```shell
    $ curl -i -X GET \
      'http://127.0.0.1:8889/search/do?name=%E8%A5%BF%E6%B8%B8%E8%AE%B0'
    ```
    ```text
    HTTP/1.1 401 Unauthorized
    Date: Mon, 08 Feb 2021 10:41:57 GMT
    Content-Length: 0
    ```
  Obviously, the jwt authentication failed, and the statusCode of 401 is returned. Next, let's take a jwt token (that is, the `accessToken` returned by the user login)
    ```shell
    $ curl -i -X GET \
      'http://127.0.0.1:8889/search/do?name=%E8%A5%BF%E6%B8%B8%E8%AE%B0' \
      -H 'authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MTI4NjcwNzQsImlhdCI6MTYxMjc4MDY3NCwidXNlcklkIjoxfQ.JKa83g9BlEW84IiCXFGwP2aSd0xF3tMnxrOzVebbt80'
    ```
    ```text
    HTTP/1.1 200 OK
    Content-Type: application/json
    Date: Mon, 08 Feb 2021 10:44:45 GMT
    Content-Length: 21

    {"name":"","count":0}
    ```

    > [!TIP]
    > Service startup error, please check [Error](error.md)


At this point, the demonstration of jwt from generation to use is complete. The authentication of jwt token is already encapsulated in go-zero. You only need to simply declare it when defining the service in the api file.

### Get the information carried in the jwt token
After go-zero is parsed from the jwt token, the kv passed in when the user generates the token will be placed in the Context of http.Request intact, so we can get the value you want through the Context.

```shell
$ vim /service/search/cmd/api/internal/logic/searchlogic.go
```
Add a log to output the userId parsed from jwt.
```go
func (l *SearchLogic) Search(req types.SearchReq) (*types.SearchReply, error) {
	logx.Infof("userId: %v",l.ctx.Value("userId"))// 这里的key和生成jwt token时传入的key一致
	return &types.SearchReply{}, nil
}
```
Output
```text
{"@timestamp":"2021-02-09T10:29:09.399+08","level":"info","content":"userId: 1"}
```

# Guess you wants
* [JWT](https://jwt.io/)
* [API Configuration](api-config.md)
* [API IDL](api-grammar.md)

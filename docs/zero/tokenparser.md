# tokenparser

对于请求头`Authorization`中token的解析，内部实现了jwt密钥的无感更新


### quick start


```go
const (
      key     = "14F17379-EB8F-411B-8F12-6929002DCA76"
      prevKey = "B63F477D-BBA3-4E52-96D3-C0034C27694A"
   )

func main() {
      req := httptest.NewRequest(http.MethodGet, "http://localhost", nil)
  		//生成token
      token, err := buildToken(key, map[string]interface{}{
         "key": "value",
      }, 3600)
      req.Header.Set("Authorization", "Bearer "+token)
		//初始化
      parser := NewTokenParser(WithResetDuration(time.Minute))
  		//token解析
      tok, err := parser.ParseToken(req, key, prevKey)
}
```


### jwt密码更新


```go
func (tp *TokenParser) ParseToken(r *http.Request, secret, prevSecret string){
  //.....
  if len(prevSecret) > 0 {
		count := tp.loadCount(secret)
		prevCount := tp.loadCount(prevSecret)

		var first, second string
		if count > prevCount {
			first = secret
			second = prevSecret
		} else {
			first = prevSecret
			second = secret
		}

		token, err = tp.doParseToken(r, first)
		if err != nil {
			token, err = tp.doParseToken(r, second)
			if err != nil {
				return nil, err
			} else {
				tp.incrementCount(second)
			}
		} else {
			tp.incrementCount(first)
		}
	} else {
		token, err = tp.doParseToken(r, secret)
		if err != nil {
			return nil, err
		}
	}
  //.....
}
```


对比新旧密钥的历史使用次数，先用被使用次数多的密钥解析，不成功在使用使用次数少密钥的解析，有效减少token的被解析次数


### NewTokenParser()可配参数


```go
func WithResetDuration(duration time.Duration) ParseOption {
   return func(parser *TokenParser) {
      parser.resetDuration = duration
   }
}
```


用于对jwt密钥使用次数数据的清理


<Vssue title="tokenparser" />

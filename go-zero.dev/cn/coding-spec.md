# 编码规范

## import
* 单行import不建议用圆括号包裹
* 按照`官方包`，NEW LINE，`当前工程包`，NEW LINE，`第三方依赖包`顺序引入
    ```go
    import (
        "context"
        "string"
  
        "greet/user/internal/config"
  
        "google.golang.org/grpc"
    )
    ```

## 函数返回
* 对象避免非指针返回
* 遵循有正常值返回则一定无error，有error则一定无正常值返回的原则

## 错误处理
* 有error必须处理，如果不能处理就必须抛出。
* 避免下划线(_)接收error

## 函数体编码
* 建议一个block结束空一行，如if、for等
    ```go
    func main (){
        if x==1{
            // do something
        }
  
        fmt.println("xxx")
    }
    ```
* return前空一行
    ```go
    func getUser(id string)(string,error){
        ....
  
        return "xx",nil
    }
    ```
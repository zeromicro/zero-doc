---
sidebar_position: 1
---

# 开发规范

在实际业务开发中，除了要提高业务开发效率，缩短业务开发周期，保证线上业务高性能，高可用的指标外，好的编程习惯也是一个开发人员基本素养之一，在本章节， 我们将介绍一下go-zero中的编码规范，本章节为可选章节，内容仅供交流与参考

## 开发三原则

### Clarity（清晰）
作者引用了`Hal Abelson and Gerald Sussman`的一句话：
> Programs must be written for people to read, and only incidentally for machines to execute

程序是什么，程序必须是为了开发人员阅读而编写的，只是偶尔给机器去执行，99%的时间程序代码面向的是开发人员，而只有1%的时间可能是机器在执行，这里比例不是重点，从中我们可以看出，清晰的代码是多么的重要，因为所有程序，不仅是Go语言，都是由开发人员编写，供其他人阅读和维护。


### Simplicity（简单）
> Simplicity is prerequisite for reliability

`Edsger W. Dijkstra`认为：可靠的前提条件就是简单，我们在实际开发中都遇到过，这段代码在写什么，想要完成什么事情，开发人员不理解这段代码，因此也不知道如何去维护，这就带来了复杂性，程序越是复杂就越难维护，越难维护就会是程序变得越来越复杂，因此，遇到程序变复杂时首先应该想到的是——重构，重构会重新设计程序，让程序变得简单。

### Productivity（生产力）
在go-zero团队中，一直在强调这个话题，开发人员成产力的多少，并不是你写了多少行代码，完成了多少个模块开发，而是我们需要利用各种有效的途径来利用有限的时间完成开发效率最大化，而Goctl的诞生正是为了提高生产力，
因此这个开发原则我是非常认同的。

## 命名规范

在任何语言开发中，都有其语言领域的一些命名规范，好的命名可以：
* 降低代码阅读成本
* 降低维护难度
* 降低代码复杂度

### 规范建议
在我们实际开发中，有很多开发人可能是由某一语言转到另外一个语言领域，在转到另外一门语言后，
我们都会保留着对旧语言的编程习惯，在这里，我建议的是，虽然不同语言之前的某些规范可能是相通的，
但是我们最好能够按照官方的一些demo来熟悉是渐渐适应当前语言的编程规范，而不是直接将原来语言的编程规范也随之迁移过来。

### 命名准则
* 当变量名称在定义和最后一次使用之间的距离很短时，简短的名称看起来会更好。
* 变量命名应尽量描述其内容，而不是类型
* 常量命名应尽量描述其值，而不是如何使用这个值
* 在遇到for，if等循环或分支时，推荐单个字母命名来标识参数和返回值
* method、interface、type、package推荐使用单词命名
* package名称也是命名的一部分，请尽量将其利用起来
* 使用一致的命名风格

### 文件命名规范
* 全部小写
* 除unit test外避免下划线(_)
* 文件名称不宜过长

### 变量命名规范参考
* 首字母小写
* 驼峰命名
* 见名知义，避免拼音替代英文
* 不建议包含下划线(_)
* 不建议包含数字

**适用范围**
* 局部变量
* 函数出参、入参

### 函数、常量命名规范
* 驼峰式命名
* 可exported的必须首字母大写
* 不可exported的必须首字母小写
* 避免全部大写与下划线(_)组合


:::tip
如果是go-zero代码贡献，则必须严格遵循此命名规范
:::

### 参考文档
* [Practical Go: Real world advice for writing maintainable Go programs](https://dave.cheney.net/practical-go/presentations/gophercon-singapore-2019.html#_simplicity)

## 路由规范
* 推荐脊柱式命名
* 小写单词、横杠(-)组合
* 见名知义

```go
/user/get-info
/user/get/info
/user/password/change/:id
```

## 编码规范

### import
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

### 函数返回
* 对象避免非指针返回
* 遵循有正常值返回则一定无error，有error则一定无正常值返回的原则

### 错误处理
* 有error必须处理，如果不能处理就必须抛出。
* 避免下划线(_)接收error

### 函数体编码
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
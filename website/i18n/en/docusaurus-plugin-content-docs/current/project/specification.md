---
sidebar_position: 1
---

# Development Specifications

In the actual business development, in addition to improving business development efficiency, shortening business development cycle, ensuring high performance and high availability of online business indicators, good programming habits is also one of the basic qualities of a developer, in this section, we will introduce the coding specification in go-zero, this section is optional, the content is for communication and reference only

## Three principles of development

### Clarity
The authors quote `Hal Abelson and Gerald Sussman`.
> Programs must be written for people to read, and only incidentally for machines to execute

Programs are what they are, programs must be written for developers to read, and only incidentally for machines to execute, 99% of the time program code is geared towards developers, and only 1% of the time it may be executed by machines, the ratio is not the point here, from which we can see how important clear code is, because all programs, not just Go languages, are written by developers for others to read and maintain.


### Simplicity
> Simplicity is prerequisite for reliability

`Edsger W. Dijkstra` believes that: the prerequisite for reliability is simplicity, we have all encountered in the actual development, what this code is writing and what it wants to accomplish, the developer does not understand this code, and therefore does not know how to maintain it, which brings complexity, the more complex the program is the harder it is to maintain, the harder it is to maintain it will be the program becomes more and more complex, therefore The first thing you should think of when you encounter a complex program is - refactoring, refactoring will redesign the program to make it simple.

### Productivity
In the go-zero team, we have been emphasizing this topic, the amount of developer productivity is not how many lines of code you have written or how many modules you have completed, but we need to use various effective ways to maximize the development efficiency with limited time, and Goctl was born to improve productivity.
So this development principle is very much agreeable to me.

## Naming conventions

In any language development, there are naming conventions for the language domain, and good naming can
* reduce the cost of reading code
* reduce maintenance difficulties
* Reduce code complexity

### Normative suggestions
In our actual development, there are many developers who may have moved from one language to another language domain, and after moving to another language
We all retain our programming habits for the old language, and what I suggest here is that although some of the specifications may have been common before for different languages.
But it is better to follow the official demos to get familiar with the programming conventions of the current language than to migrate them directly from the original language.

### Naming guidelines
* When the distance between the definition and the last use of a variable name is short, a short name looks better.
* Variable naming should try to describe its content, not its type
* Constant naming should try to describe its value, not how the value is used
* When it comes to loops or branches such as for, if, etc., single letter naming is recommended to identify parameters and return values
* word naming is recommended for method, interface, type, package
* Package names are also part of naming, please try to make use of them
* Use a consistent naming style

### File naming convention
* All lowercase
* Avoid underscores (_) except for unit test
* File names should not be too long

### Variable naming convention reference
* Lowercase first letter
* Hump naming
* See the name and avoid phonetic substitution for English
* It is not recommended to include underscores (_)
* Not recommended to include numbers

* * Scope of application **
* Local variables
* function reference, input reference

### Function and constant naming convention
* Humped naming
* Exported must be capitalized
* Non-exported must be lowercase
* Avoid all capitalization and underscore (_) combinations


:::tip
If you are contributing go-zero code, you must strictly follow this naming convention
:::

### Reference documentation
* [Practical Go: Real world advice for writing maintainable Go programs](https://dave.cheney.net/practical-go/presentations/gophercon- singapore-2019.html#_simplicity)

## Routing specifications
* Recommended spine naming
* lowercase words, horizontal bar (-) combinations
* see the name to know the meaning

```go
/user/get-info
/user/get/info
/user/password/change/:id
```

## Coding specification

### import
* Single line import is not recommended to be wrapped in parentheses
* Introduce ``official package'', ``new line'', ``current project package'', ``new line'', ``third-party dependency package'' in order
    ```go
    import (
        "context"
        "string"

        "greet/user/internal/config"

        "google.golang.org/grpc"
    )
    ```

### Function returns
* objects avoid non-pointer returns
* Follow the principle that if there is a normal value returned, there must be no error, and if there is an error, there must be no normal value returned

### Error handling
* must handle if there is an error, must throw if it cannot be handled.
* Avoid underscores (_) to receive error

### Function body coding
* It is recommended that a block ends with an empty line, such as if, for, etc.
    ```go
    func main (){
        if x==1{
            // do something
        }

        fmt.println("xxx")
    }
    ```
* empty line before return
    ```go
    func getUser(id string)(string,error){
        ....

        return "xx",nil
    }
    ```
# Coding Rules

> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

## import
* Single-line import is not recommended being wrapped in parentheses
* Introduce in the order of `Official Package`, NEW LINE, `Project Package`, NEW LINE, `Third Party Dependent Package`
    ```go
    import (
        "context"
        "string"
  
        "greet/user/internal/config"
  
        "google.golang.org/grpc"
    )
    ```

## Function returns
* Object avoids non-pointer return
* Follow the principle that if there is a normal value return, there must be no error, and if there is an error, there must be no normal value return.

## Error handling
* An error must be handled, if it cannot be handled, it must be thrown.
* Avoid underscore (_) receiving error

## Function body coding
* It is recommended that a block end with a blank line, such as if, for, etc.
    ```go
    func main (){
        if x==1{
            // do something
        }
  
        fmt.println("xxx")
    }
    ```
* Blank line before return
    ```go
    func getUser(id string)(string,error){
        ....
  
        return "xx",nil
    }
    ```
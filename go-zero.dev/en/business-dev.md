# Business development

> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

In this chapter, we use a simple example to demonstrate some basic functions in go-zero. This section will contain the following subsections:
  * [Directory Structure](service-design.md)
  * [Model Generation](model-gen.md)
  * [API Coding](api-coding.md)
  * [Business Coding](business-coding.md)
  * [JWT](jwt.md)
  * [Middleware](middleware.md)
  * [RPC Implement & Call](rpc-call.md)
  * [Error Handling](error-handle.md)

## Demo project download
Before officially entering the follow-up document description, you can pay attention to the source code here, and we will perform a progressive demonstration of the function based on this source code.
Instead of starting from 0 completely, if you come from the [Quick Start](quick-start.md) chapter, this source code structure is not a problem for you.

<a href="https://zeromicro.github.io/go-zero-pages/resource/book.zip">Click Here</a> to download Demo project

## Demonstration project description

### Scenes
The programmer Xiao Ming needs to borrow a copy of "Journey to the West". When there is no online library management system, he goes to the front desk of the library to consult with the librarian every day.
* Xiao Ming: Hello, do you still have the book "Journey to the West" today?
* Administrator: No more, let's check again tomorrow.

One day later, Xiao Ming came to the library again and asked:
* Xiao Ming: Hello, do you still have the book "Journey to the West" today?
* Administrator: No, you can check again in two days.

After many repetitions in this way, Xiao Ming was also in vain and wasted a lot of time on the way back and forth, so he finally couldn't stand the backward library management system.
He decided to build a book review system by himself.

### Expected achievement
* User login: 
  Rely on existing student system data to log in
* Book search: 
  Search for books based on book keywords and query the remaining number of books.

### System analysis

#### Service design
* user
  * api: provides user login protocol
  * rpc: for search service to access user data
* search
    * api: provide book query agreement

> [!TIP]
> Although this tiny book borrowing query system is small, it does not fit the business scenario in practice, but only the above two functions have already met our demonstration of the go-zero api/rpc scenario.
> In order to satisfy the richer go-zero function demonstration in the future, business insertion, that is, related function descriptions, will be carried out in the document. Here only one scene is used for introduction.
>
> NOTE: Please create the sql statement in the user into the db by yourself, see [prepare](prepare.md) for more preparation work
>
> Add some preset user data to the database for later use. For the sake of space, the demonstration project does not demonstrate the operation of inserting data in detail.


# Reference preset data
```sql
INSERT INTO `user` (number,name,password,gender)values ('666','xiaoming','123456','male');
```
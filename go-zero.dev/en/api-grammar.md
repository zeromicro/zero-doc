# API syntax
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

## API IDL example

```go
/**
 * api syntax example and syntax description
 */

// api syntax version
syntax = "v1"

// import literal
import "foo.api"

// import group
import (
    "bar.api"
    "foo/bar.api"
)
info(
    author: "anqiansong"
    date:   "2020-01-08"
    desc:   "api syntax example and syntax description"
)

// type literal

type Foo{
    Foo int `json:"foo"`
}

// type group

type(
    Bar{
        Bar int `json:"bar"`
    }
)

// service block
@server(
    jwt:   Auth
    group: foo
)
service foo-api{
    @doc "foo"
    @handler foo
    post /foo (Foo) returns (Bar)
}
```

## API syntax structure

* syntax statement
* import syntax block
* info syntax block
* type syntax block
* service syntax block
* hidden channel

> [!TIP]
> In the above grammatical structure, grammatically speaking, each grammar block can be declared anywhere in the .api file according to the grammatical block.> But in order to improve reading efficiency, we suggest to declare in the above order, because it may be in the future Strict mode is used to control the order of syntax blocks.

### syntax statement

syntax is a newly added grammatical structure, the introduction of the grammar can solve:

* Quickly locate the problematic grammatical structure of the api version
* Syntax analysis for the version
* Prevent the big version upgrade of api syntax from causing backward compatibility

> **[!WARNING]
> The imported api must be consistent with the syntax version of the main api.

**Grammar definition**

```antlrv4
'syntax'={checkVersion(p)}STRING
```

**Grammar description**

syntax: Fixed token, marking the beginning of a syntax structure

checkVersion: Custom go method to detect whether `STRING` is a legal version number. The current detection logic is that STRING must meet the regularity of `(?m)"v[1-9][0-9]"`.

STRING: A string of English double quotes, such as "v1"

An api grammar file can only have 0 or 1 syntax statement. If there is no syntax, the default version is `v1`

**Examples of correct syntax** ✅

eg1: Irregular writing

```api
syntax="v1"
```

eg2: Standard writing (recommended)

```api
syntax = "v2"
```

**Examples of incorrect syntax** ❌

eg1：

```api
syntax = "v0"
```

eg2：

```api
syntax = v1
```

eg3：

```api
syntax = "V1"
```

## Import syntax block

As the business scale increases, there are more and more structures and services defined in the api. 
All the grammatical descriptions are in one api file. This is a problem, and it will greatly increase the difficulty of reading and maintenance. 
Import The grammar block can help us solve this problem. By splitting the api file, different api files are declared according to certain rules, 
which can reduce the difficulty of reading and maintenance.

> **[!WARNING]
> Import here does not include package declarations like golang, it is just the introduction of a file path. After the final analysis, all the declarations will be gathered into a spec.Spec.
> You cannot import multiple identical paths, otherwise it will cause parsing errors.

**Grammar definition**

```antlrv4
'import' {checkImportValue(p)}STRING  
|'import' '(' ({checkImportValue(p)}STRING)+ ')'
```

**Grammar description**

import: fixed token, marking the beginning of an import syntax

checkImportValue: Custom go method to detect whether `STRING` is a legal file path. The current detection logic is that STRING must satisfy `(?m)"(?[az AZ 0-9_-])+\. api"` regular.

STRING: A string of English double quotes, such as "foo.api"

**Examples of correct syntax** ✅

eg：

```api
import "foo.api"
import "foo/bar.api"

import(
    "bar.api"
    "foo/bar/foo.api"
)
```

**Examples of incorrect syntax** ❌

eg：

```api
import foo.api
import "foo.txt"
import (
    bar.api
    bar.api
)
```

## info syntax block

The info grammar block is a grammar body that contains multiple key-value pairs. 
Its function is equivalent to the description of an api service. The parser will map it to spec.Spec for translation into other languages ​​(golang, java, etc.)
Is the meta element that needs to be carried. If it is just a description of the current api, without considering its translation to other languages, 
you can use simple multi-line comments or java-style documentation comments. For comment descriptions, please refer to the hidden channels below.

> **[!WARNING]
> Duplicate keys cannot be used, each api file can only have 0 or 1 info syntax block

**Grammar definition**

```antlrv4
'info' '(' (ID {checkKeyValue(p)}VALUE)+ ')'
```

**Grammar description**

info: fixed token, marking the beginning of an info syntax block

checkKeyValue: Custom go method to check whether `VALUE` is a legal value.

VALUE: The value corresponding to the key, which can be any character after a single line except'\r','\n',''. For multiple lines, please wrap it with "", but it is strongly recommended that everything be wrapped with ""

**Examples of correct syntax** ✅

eg1：Irregular writing

```api
info(
foo: foo value
bar:"bar value"
    desc:"long long long long
long long text"
)
```

eg2：Standard writing (recommended)

```api
info(
    foo: "foo value"
    bar: "bar value"
    desc: "long long long long long long text"
)
```

**Examples of incorrect syntax** ❌

eg1：No key-value

```api
info()
```

eg2：Does not contain colon

```api
info(
    foo value
)
```

eg3：key-value does not wrap

```api
info(foo:"value")
```

eg4：No key

```api
info(
    : "value"
)
```

eg5：Illegal key

```api
info(
    12: "value"
)
```

eg6：Remove the old version of multi-line syntax

```api
info(
    foo: >
    some text
    <
)
```

## type syntax block

In the api service, we need to use a structure (class) as the carrier of the request body and the response body. 
Therefore, we need to declare some structures to accomplish this. The type syntax block evolved from the type of golang. 
Of course It also retains some of the characteristics of golang type, and the following golang characteristics are used:

* Keep the built-in data types of golang `bool`,`int`,`int8`,`int16`,`int32`,`int64`,`uint`,`uint8`,`uint16`,`uint32`,`uint64`,`uintptr`
  ,`float32`,`float64`,`complex64`,`complex128`,`string`,`byte`,`rune`,
* Compatible with golang struct style declaration
* Keep golang keywords

> **[!WARNING]️
> * Does not support alias
> * Does not support `time.Time` data type
> * Structure name, field name, cannot be a golang keyword

**Grammar definition**

Since it is similar to golang, it will not be explained in detail. Please refer to the typeSpec definition in [ApiParser.g4](https://github.com/zeromicro/go-zero/blob/master/tools/goctl/api/parser/g4/ApiParser.g4) for the specific syntax definition.

**Grammar description**

Refer to golang writing

**Examples of correct syntax** ✅

eg1：Irregular writing

```api
type Foo struct{
    Id int `path:"id"` // ①
    Foo int `json:"foo"`
}

type Bar struct{
    // Non-exported field
    bar int `form:"bar"`
}

type(
    // Non-derived structure
    fooBar struct{
        FooBar int
    }
)
```

eg2: Standard writing (recommended)

```api
type Foo{
    Id int `path:"id"`
    Foo int `json:"foo"`
}

type Bar{
    Bar int `form:"bar"`
}

type(
    FooBar{
        FooBar int
    }
)
```

**Examples of incorrect syntax** ❌

eg

```api
type Gender int // not support

// Non-struct token
type Foo structure{ 
  CreateTime time.Time // Does not support time.Time
}

// golang keyword var
type var{} 

type Foo{
  // golang keyword interface
  Foo interface 
}


type Foo{
  foo int 
  // The map key must have the built-in data type of golang
  m map[Bar]string
}
```

> [!NOTE]  ①
> The tag definition is the same as the json tag syntax in golang. In addition to the json tag, go-zero also provides some other tags to describe the fields,
> See the table below for details.

* tag table

  When binding parameters, the following four tags cannot exist at the same time. Only one of them can be selected
  <table>
  <tr>
    <td>tag key</td> <td>Description</td> <td>Provider</td><td>Effective Coverage</td> <td>Example</td>
  </tr>
  <tr> 
  <td>json</td> <td>Json serialization tag</td> <td>golang</td> <td>request、response</td> <td><code>json:"fooo"</code></td>
  </tr>
  <tr>
  <td>path</td> <td>Routing path, such as<code>/foo/:id</code></td> <td>go-zero</td> <td>request</td> <td><code>path:"id"</code></td>
  </tr>
  <tr>
  <td>form</td> <td>Mark that the request body is a form (in the POST method) or a query (in the GET method)<code>/search?name=keyword</code>)</td> <td>go-zero</td> <td>request</td> <td><code>form:"name"</code></td>
  </tr>
  <tr>
  <td>header</td> <td>Parse values from HTTP headers, like <code>Name: value</code></td> <td>go-zero</td> <td>request</td> <td><code>header:"name"</code></td>
  </tr>
  </table>
* tag modifier

  Common parameter verification description
  <table>
  <tr>
  <td>tag key </td> <td>Description </td> <td>Provider </td> <td>Effective Coverage </td> <td>Example </td>
  </tr>
  <tr>
  <td>optional</td> <td>Define the current field as an optional parameter</td> <td>go-zero</td> <td>request</td> <td><code>json:"name,optional"</code></td>
  </tr>
  <tr>
  <td>options</td> <td>Define the enumeration value of the current field, separated by a vertical bar <code>|</code></td> <td>go-zero</td> <td>request</td> <td><code>json:"gender,options=male"</code></td>
  </tr>
  <tr>
  <td>default</td> <td>Define the default value of the current field</td> <td>go-zero</td> <td>request</td> <td><code>json:"gender,default=male"</code></td>
  </tr>
  <tr>
  <td>range</td> <td>Define the value range of the current field</td> <td>go-zero</td> <td>request</td> <td><code>json:"age,range=[0:120]"</code></td>
  </tr>
  </table>

  > [!TIP]
  > The tag modifier needs to be separated by a quotation comma after the tag value

## service syntax block

The service syntax block is used to define api services, including service name, service metadata, middleware declaration, routing, handler, etc.

> **[!WARNING]️
> * The service name of the main api and the imported api must be the same, and there must be no ambiguity in the service name.
> * The handler name cannot be repeated
> * The name of the route (request method + request path) cannot be repeated
> * The request body must be declared as a normal (non-pointer) struct, and the response body has been processed for forward compatibility. Please refer to the following description for details
>

**Grammar definition**

```antlrv4
serviceSpec:    atServer? serviceApi;
atServer:       '@server' lp='(' kvLit+ rp=')';
serviceApi:     {match(p,"service")}serviceToken=ID serviceName lbrace='{' serviceRoute* rbrace='}';
serviceRoute:   atDoc? (atServer|atHandler) route;
atDoc:          '@doc' lp='('? ((kvLit+)|STRING) rp=')'?;
atHandler:      '@handler' ID;
route:          {checkHttpMethod(p)}httpMethod=ID path request=body? returnToken=ID? response=replybody?;
body:           lp='(' (ID)? rp=')';
replybody:      lp='(' dataType? rp=')';
// kv
kvLit:          key=ID {checkKeyValue(p)}value=LINE_VALUE;

serviceName:    (ID '-'?)+;
path:           (('/' (ID ('-' ID)*))|('/:' (ID ('-' ID)?)))+;
```

**Grammar description**

serviceSpec: Contains an optional syntax block `atServer` and `serviceApi` syntax block, which follow the sequence mode (the service must be written in order, otherwise it will be parsed incorrectly)

atServer: Optional syntax block, defining server metadata of the key-value structure,'@server' indicates the beginning of this server syntax block, which can be used to describe serviceApi or route syntax block, and it has some special keys when it is used to describe different syntax blocks key needs attention，see **atServerKey Key Description**。

serviceApi: Contains one or more `serviceRoute` syntax blocks

serviceRoute: Contains `atDoc`, handler and `route` in sequence mode

atDoc: Optional syntax block, a key-value description of a route, which will be passed to the spec.Spec structure after parsing. If you don't care about passing it to spec.Spec, it is recommended to use a single-line comment instead.

handler: It is a description of the handler layer of routing. You can specify the handler name by specifying the `handler` key by atServer, or you can directly use the atHandler syntax block to define the handler name

atHandler: `@handler` fixed token, followed by a value following the regularity `[_a-zA-Z][a-zA-Z_-]`, used to declare a handler name

route: Routing consists of `httpMethod`, `path`, optional `request`, optional `response`, and `httpMethod` must be lowercase.

body: api request body grammar definition, it must be an optional ID value wrapped by ()

replyBody: api response body grammar definition, must be a struct wrapped by ()、~~array(Forward compatible processing, it may be discarded in the future, it is strongly recommended to wrap it in struct instead of using array directly as the response body)~~

kvLit: Same as info key-value

serviceName: There can be multiple'-'join ID values

path: The api request path must start with `/` or `/:`, and must not end with `/`. The middle can contain ID or multiple ID strings with `-` join

**atServerKey Key Description**

When modifying the service

<table>
<tr>
<td>key</td><td>Description</td><td>Example</td>
</tr>
<tr>
<td>jwt</td><td>Declare that all routes under the current service require jwt authentication, and code containing jwt logic will be automatically generated</td><td><code>jwt: Auth</code></td>
</tr>
<tr>
<td>group</td><td>Declare the current service or routing file group</td><td><code>group: login</code></td>
</tr>
<tr>
<td>middleware</td><td>Declare that the current service needs to open the middleware</td><td><code>middleware: AuthMiddleware</code></td>
</tr>
<tr>
<td>prefix</td><td>Declare a route prefix</td><td><code>prefix: /api</code></td>
</tr>
</table>

When modifying the route

<table>
<tr>
<td>key</td><td>Description</td><td>Example</td>
</tr>
<tr>
<td>handler</td><td>Declare a handler</td><td>-</td>
</tr>
</table>

**Examples of correct syntax** ✅

eg1：Irregular writing

```api
@server(
  jwt: Auth
  group: foo
  middleware: AuthMiddleware
  prefix: /api
)
service foo-api{
  @doc(
    summary: foo
  )
  @server(
    handler: foo
  )
  // Non-exported body
  post /foo/:id (foo) returns (bar)
  
  @doc "bar"
  @handler bar
  post /bar returns ([]int)// Array is not recommended as response body
  
  @handler fooBar
  post /foo/bar (Foo) returns // You can omit 'returns'
}
```

eg2：Standard writing (recommended)

```api
@server(
  jwt: Auth
  group: foo
  middleware: AuthMiddleware
  prefix: /api
)
service foo-api{
  @doc "foo"
  @handler foo
  post /foo/:id (Foo) returns (Bar)
}

service foo-api{
  @handler ping
  get /ping
  
  @doc "foo"
  @handler bar
  post /bar/:id (Foo)
}

```

**Examples of incorrect syntax** ❌

```api
// Empty server syntax block is not supported
@server(
)
// Empty service syntax block is not supported
service foo-api{
}

service foo-api{
  @doc kkkk // The short version of the doc must be enclosed in English double quotation marks
  @handler foo
  post /foo
  
  @handler foo // Duplicate handler
  post /bar
  
  @handler fooBar
  post /bar // Duplicate routing
  
  // @handler and @doc are in the wrong order
  @handler someHandler
  @doc "some doc"
  post /some/path
  
  // handler is missing
  post /some/path/:id
  
  @handler reqTest
  post /foo/req (*Foo) // Data types other than ordinary structures are not supported as the request body
  
  @handler replyTest
  post /foo/reply returns (*Foo) // Does not support data types other than ordinary structures and arrays (forward compatibility, later considered to be discarded) as response bodies
}
```

## Hidden channel

Hidden channels are currently mainly blank symbols, newline symbols and comments. Here we only talk about comments, because blank symbols and newline symbols are currently useless.

### Single line comment

**Grammar definition**

```antlrv4
'//' ~[\r\n]*
```

**Grammar description**
It can be known from the grammatical definition that single-line comments must start with `//`, and the content cannot contain newline characters

**Examples of correct syntax** ✅

```api
// doc
// comment
```

**Examples of incorrect syntax** ❌

```api
// break
line comments
```

### java style documentation comments

**Grammar definition**

```antlrv4
'/*' .*? '*/'
```

**Grammar description**

It can be known from the grammar definition that a single line comment must start with any character that starts with `/*` and ends with `*/`.

**Examples of correct syntax** ✅

```api
/**
 * java-style doc
 */
```

**Examples of incorrect syntax** ❌

```api
/*
 * java-style doc */
 */
```

## Doc&Comment

If you want to get the doc or comment of a certain element, how do you define it?

**Doc**

We stipulate that the number of lines in the previous grammar block (non-hidden channel content) 
line+1 to all comments (the current line, or multiple lines) before the first element of the current grammar block are doc， 
And retain the original mark of `//`, `/*`, `*/`.

**Comment**

We specify that a comment block (the current line, or multiple lines) at the beginning of the line where the last element of the current syntax block is located is comment, 
And retain the original mark of `//`, `/*`, `*/`.

Syntax block **Doc** and **Comment** support situation

<table>
<tr>
  <td>Syntax block</td><td>Parent Syntax Block</td><td>Doc</td><td>Comment</td>
</tr>
<tr>
  <td>syntaxLit</td><td>api</td><td>✅</td><td>✅</td>
</tr>
<tr>
  <td>kvLit</td><td>infoSpec</td><td>✅</td><td>✅</td>
</tr>
<tr>
  <td>importLit</td><td>importSpec</td><td>✅</td><td>✅</td>
</tr>
<tr>
  <td>typeLit</td><td>api</td><td>✅</td><td>❌</td>
</tr>
<tr>
  <td>typeLit</td><td>typeBlock</td><td>✅</td><td>❌</td>
</tr>
<tr>
  <td>field</td><td>typeLit</td><td>✅</td><td>✅</td>
</tr>
<tr>
  <td>key-value</td><td>atServer</td><td>✅</td><td>✅</td>
</tr>
<tr>
  <td>atHandler</td><td>serviceRoute</td><td>✅</td><td>✅</td>
</tr>
<tr>
  <td>route</td><td>serviceRoute</td><td>✅</td><td>✅</td>
</tr>
</table>

The following is the writing of doc and comment after the corresponding syntax block is parsed

```api
// syntaxLit doc
syntax = "v1" // syntaxLit commnet

info(
  // kvLit doc
  author: songmeizi // kvLit comment
)

// typeLit doc
type Foo {}

type(
  // typeLit doc
  Bar{}
  
  FooBar{
    // filed doc
    Name int // filed comment
  }
)

@server(
  /**
   * kvLit doc
   * Enable jwt authentication
   */
  jwt: Auth /**kvLit comment*/
)
service foo-api{
  // atHandler doc
  @handler foo //atHandler comment
  
  /*
   * Route doc
   * Post request
   * Route path: foo
   * Request body: Foo
   * Response body: Foo
   */
  post /foo (Foo) returns (Foo) // route comment
}
```

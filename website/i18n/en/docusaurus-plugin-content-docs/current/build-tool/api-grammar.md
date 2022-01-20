---
sidebar_position: 2
---

# api syntax

## api example

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
    author: "songmeizi"
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

## api syntax structure

* syntax syntax declaration
* import syntax block
* info syntax block
* type syntax block
* service syntax block
* Hidden channels

:::tip
In the above syntax structure, each syntax block can be declared anywhere in the .api file, syntactically speaking, according to the syntax block as a unit.
However, to improve reading efficiency, we recommend declaring them in the above order, as the order of syntax blocks may be controlled by strict mode in the future.
:::

### syntax syntax declaration

`syntax` is a newly added syntax construct that was introduced to address.

* Quickly locating problematic syntax constructs against api versions
* Parsing syntax for versions
* Preventing api syntax from being forward compatible due to major version upgrades

:::caution

The api being imported must match the syntax version of the main api.

:::

**Syntax Definition**

```antlrv4
'syntax'={checkVersion(p)}STRING
```

**Syntax Description**

syntax: fixed token that marks the beginning of a syntax structure

checkVersion: custom go method to check if `STRING` is a legal version number, the current detection logic is that STRING must be satisfying `(?m) "v[1-9][0-9]*"` regular.

STRING: a string wrapped in English double quotes, such as "v1"

An api syntax file can only have 0 or 1 syntax declaration, if there is no syntax, then the default is the v1 version

**Examples of correct syntax** ✅

eg1：Unstandardized writing method

```api
syntax="v1"
```

eg2: normative writing (recommended)

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

## import syntax block

As business size increases, more and more structures and services are defined in the api, and all the syntax descriptions are in one api file, which is such a bad problem that it will greatly increase the reading difficulty and maintenance difficulty. import syntax block can help us solve this problem by splitting the api file.
By splitting api files, different api files are declared according to certain rules, which can reduce the difficulty of reading and maintaining.

:::caution

Here import does not contain package declarations like golang, it is just an introduction of file paths, and eventually parsing will bring all declarations together into a single spec.
You can't import more than one of the same path, otherwise it will be parsed incorrectly.

:::

**Syntax Definition**

```antlrv4
'import' {checkImportValue(p)}STRING  
|'import' '(' ({checkImportValue(p)}STRING)+ ')'
```

**Syntax Description**

import: fixed token, marking the beginning of an import syntax

checkImportValue: custom go method to check if `STRING` is a legal file path, the current detection logic is that STRING must be satisfying `(?m)"(/? [a-zA-Z0-9_#-])+\.api"` canonical.

STRING: a string wrapped in English double quotes, e.g. "foo.api"

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

The info syntax block is a syntax body containing multiple key-value pairs, which is equivalent to the description of an api service, and is mapped by the parser to the spec.
Spec for the meta elements that need to be carried when translating to other languages (golang, java, etc.). If it's just a description of the current api, without considering its translation to other languages, a simple multi-line comment or a java-style documentation comment is sufficient; see **Hidden Passages** below for comment descriptions.

:::caution

Cannot use duplicate keys, only 0 or 1 info syntax block per api file

:::

**Syntax Definition**

```antlrv4
'info' '(' (ID {checkKeyValue(p)}VALUE)+ ')'
```

**Syntax Description**

info: fixed token, marking the beginning of an info syntax block

checkKeyValue: custom go method, check if `VALUE` is a legal value.

VALUE: the value corresponding to the key, can be a single line except '\r', '\n', '/' after any character, multiple lines please wrap with "", but it is strongly recommended that all are wrapped with ""

**Examples of correct syntax** ✅

eg1：Unstandardized writing method

```api
info(
foo: foo value
bar:"bar value"
    desc:"long long long long
long long text"
)
```

eg2: normative writing (recommended)

```api
info(
    foo: "foo value"
    bar: "bar value"
    desc: "long long long long long long text"
)
```

**Examples of incorrect syntax** ❌

eg1：No key-value content

```api
info()
```

eg2：Does not contain a colon

```api
info(
    foo value
)
```

eg3：key-value without newline

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

eg6：Remove old version multi-line syntax

```api
info(
    foo: >
    some text
    <
)
```

## type syntax block

In api service, we need to use a structure (class) as a request body, response body carrier, so we need to declare some structure to do this thing, type syntax block evolved from golang type, of course, also retains some golang type characteristics, along with golang characteristics are.

* preserves the golang built-in data types `bool`,`int`,`int8`,`int16`,`int32`,`int64`,`uint`,`uint8`,`uint16`,`uint32`,`uint64`,`uintptr`
  ,`float32`,`float64`,`complex64`,`complex128`,`string`,`byte`,`rune`,
* Compatible with golang struct style declarations
* Retain golang keywords

:::caution

 * alias is not supported
 * The time.Time data type is not supported
 * Structure names, field names, and cannot be golang keywords

:::

**Syntax Definition**

Since it is similar to golang, it will not be described in detail. Please see the specific syntax definition in [ApiParser.g4](https://github.com/zeromicro/go-zero/blob/master/tools/goctl/api/parser/g4/ApiParser. g4) to see the typeSpec definition.

**Syntax description**

Refer to golang writing style

**Correct syntax example** ✅

eg1: not written in the correct way

```api
type Foo struct{
    Id int `path:"id"` // ①
    Foo int `json:"foo"`
}

type Bar struct{
    // Non-exportable fields
    bar int `form:"bar"`
}

type(
    // Non-exportable Structs
    fooBar struct{
        FooBar int `json:"fooBar"`
    }
)
```

eg2: normative writing (recommended)

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
        FooBar int `json:"fooBar"`
    }
)
```

**Examples of incorrect syntax** ❌

eg

```api
type Gender int // Not supported

// non struct token
type Foo structure{ 
  CreateTime time.Time // Time is not supported and tag is not declared
}

// golang keyword var
type var{} 

type Foo{
  // golang keyword interface
  Foo interface  // No statement tag
}


type Foo{
  foo int 
  // map key must be a golang built-in data type with no tag declared
  m map[Bar]string
}
```

:::tip
tag definition is the same as json tag syntax in golang. In addition to json tag, go-zero also provides some other tags to implement the description of the fields.
See the following table for details.
See the table below for details. 
:::

* tag table
   <table>
   <tr>
     <td>tag key</td> <td>Description</td> <td>Provider</td><td>Valid range </td> <td>Example </td>
   </tr>
   <tr>
   <td>json</td> <td>json serialization tag</td> <td>golang</td> <td>request, response</td> <td><code>json:"fooo"</ code></td>
   </tr>
   <tr>
   <td>path</td> <td>Routing path, such as <code>/foo/:id</code></td> <td>go-zero</td> <td>request</td> < td><code>path:"id"</code></td>
   </tr>
   <tr>
   <td>form</td> <td>Identifies that the request body is a form (in the POST method) or a query (in the GET method <code>/search?name=keyword</code>)</td> <td> go-zero</td> <td>request</td> <td><code>form:"name"</code></td>
   </tr>
   <tr>
   <td>header</td> <td>HTTP header, such as <code>Name: value</code></td> <td>go-zero</td> <td>request</td> <td> <code>header:"name"</code></td>
   </tr>
   </table>
* tag modifier

Common parameter verification description

<table>
   <tr>
   <td>tag key </td> <td>Description </td> <td>Provider </td> <td>Valid range </td> <td>Example </td>
   </tr>
   <tr>
   <td>optional</td> <td>Define the current field as an optional parameter</td> <td>go-zero</td> <td>request</td> <td><code>json:"name ,optional"</code></td>
   </tr>
   <tr>
   <td>options</td> <td>Define the enumeration value of the current field, multiple are separated by a vertical bar|</td> <td>go-zero</td> <td>request</td> < td><code>json:"gender,options=male"</code></td>
   </tr>
   <tr>
   <td>default</td> <td>Define the default value of the current field</td> <td>go-zero</td> <td>request</td> <td><code>json:"gender,default =male"</code></td>
   </tr>
   <tr>
   <td>range</td> <td>Define the value range of the current field</td> <td>go-zero</td> <td>request</td> <td><code>json:"age,range =[0:120]"</code></td>
   </tr>
</table>
   
:::tip
The tag modifier needs to be separated by a quoted comma after the tag value
:::

## service syntax block

service syntax block is used to define api services, including service name, service metadata, middleware declaration, routes, handlers, etc.

:::caution
* The names of the main api and the api service being imported must be the same, and there must be no service name ambiguity.
* handler names must not be repeated
* route (request method + request path) names must not be duplicated
* The request body must be declared as a normal (non-pointer) struct, the response body has some forward-compatible processing, see below for details
:::

**Syntax Definition**

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

**Syntax Description**

serviceSpec: contains an optional syntax block `atServer` and `serviceApi` syntax block, which follows the sequence pattern (writing service must follow the sequence, otherwise it will be parsed with errors)

atServer: optional syntax block, defining the server metadata of key-value structure, '@server'
It can be used to describe the serviceApi or route syntax block, and there are some special key keys that need to be noted when it is used to describe different syntax blocks, see **atServer key key description**.

serviceApi: contains 1 to multiple `serviceRoute` syntax blocks

serviceRoute: contains `atDoc`, handler and `route` according to the sequence pattern

Spec structure after parsing, if you don't care to pass it to spec.

handler: is the handler level description of the route, you can specify the handler name by specifying the `handler` key via atServer, or you can define the handler name directly using the atHandler syntax block

atHandler: '@handler' fixed token followed by a value that follows the regular `[_a-zA-Z][a-zA-Z_-]*`), used to declare a handler name

route: route, has `httpMethod`, `path`, optional `request`, optional `response`, `httpMethod` is must be lowercase.

body: api request body syntax definition, must be wrapped by the () optional ID value

replyBody: api response body syntax definition, must be wrapped by () struct, ~~array (forward-compatible processing, subsequent may be deprecated, highly recommended to struct wrapped, do not directly use array as the response body) ~~

kvLit: same as info key-value

serviceName: ID value that can have multiple '-' joins

path: api request path, must start with '/' or '/:', not end with '/', the middle can contain ID or multiple '-' join the ID string

**atServer Key Key Description Description**

When modifying service

<table>
<tr>
<td>key</td><td>Description</td><td>Example</td>
</tr>
<tr>
<td>jwt</td><td>Declare that all routes under the current service require jwt authentication, and will automatically generate code containing jwt logic</td><td><code>jwt: Auth</code></td><td><code>jwt: Auth</code></ td>
</tr>
<tr>
<td>group</td><td>Declare the current service or routing file group</td><td><code>group: login</code></td>
</tr>
<tr>
<td>middleware</td><td>Declare that the current service needs to enable middleware</td><td><code>middleware: AuthMiddleware</code></td>
</tr>

<tr>
<td>prefix</td><td>Add routing group</td><td><code>prefix: /api</code></td>
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

**Example of correct syntax** ✅

eg1：Unstandardized writing method

```api
@server(
  jwt: Auth
  group: foo
  middleware: AuthMiddleware
  prefix /api
)
service foo-api{
  @doc(
    summary: foo
  )
  @server(
    handler: foo
  )
  // Non-exportable body
  post /foo/:id (foo) returns (bar)
  
  @doc "bar"
  @handler bar
  post /bar returns ([]int)// Arrays are not recommended as response bodies
  
  @handler fooBar
  post /foo/bar (Foo) returns // 'returns' can be omitted
}
```

eg2: normative writing (recommended)

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
// Empty server syntax blocks are not supported
@server(
)
// 不支持空的service语法块
service foo-api{
}

service foo-api{
  @doc kkkk // The short version doc must be caused by double quotation marks in English
  @handler foo
  post /foo
  
  @handler foo // Repeated handlers
  post /bar
  
  @handler fooBar
  post /bar // Duplicate Routing
  
  // @handler and @doc are in the wrong order
  @handler someHandler
  @doc "some doc"
  post /some/path
  
  // handler missing
  post /some/path/:id
  
  @handler reqTest
  post /foo/req (*Foo) // Data types other than normal structures are not supported as request bodies
  
  @handler replyTest
  post /foo/reply returns (*Foo) // Do not support data types other than ordinary structures, arrays (forward compatible, subsequently considered deprecated) as response bodies
}
```

## Hidden Channels

We will only talk about comments here, because blank and newline symbols are useless at the moment.

### Single line comments

**Syntax definition**

```antlrv4
'//' ~[\r\n]*
```

**Syntax description**
As you know from the syntax definition, a single line comment must start with `//` and the content must not contain a line break

**Correct syntax example** ✅

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

**Syntax Definition**

```antlrv4
'/*' .*? '*/'
```

**Syntax description**

As you know from the syntax definition, a single line comment must start with `/*` and end with `*/` in any character.

**Example of correct syntax** ✅

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

We specify that all comments (single line, or multiple lines) from line+1 of the previous syntax block (non-hidden channel content) to the first element of the current syntax block are doc, and retain the `//`, `/*`, `*/` original tokens.

**Comment**

We specify that a comment block (on the same line, or on multiple lines) starting from the line where the last element of the current syntax block is located is a comment and retains the `//`, `/*`, `*/` primitive tokens.
Support for syntax blocks Doc and Comment

<table>
<tr>
  <td>Grammar blocks</td><td>parent syntax block</td><td>Doc</td><td>Comment</td>
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

The following is the corresponding syntax block parsed with doc and comment writing

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
   * Enabling jwt forensics
   */
  jwt: Auth /**kvLit comment*/
)
service foo-api{
  // atHandler doc
  @handler foo //atHandler comment
  
  /*
   * route doc
   * post request
   * path /foo
   * Request Body：Foo
   * Response Body：Foo
   */
  post /foo (Foo) returns (Foo) // route comment
}
```





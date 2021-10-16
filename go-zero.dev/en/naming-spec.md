# Naming Rules
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

In any language development, there are some naming conventions in the language field, good
* Reduce code reading costs
* Reduce maintenance difficulty
* Reduce code complexity

## Specification suggestion
In our actual development, many developers may transfer from one language to another language field. After switching to another language,
We will all retain the programming habits of the old language. Here, what I suggest is that although some previous specifications of different languages may be the same,
But we'd better be familiar with some official demos to gradually adapt to the programming specifications of the current language, rather than directly migrating the programming specifications of the original language.

## Naming guidelines
* When the distance between the definition and the last use of the variable name is short, the short name looks better.
* Variable naming should try to describe its content, not type
* Constant naming should try to describe its value, not how to use this value
* When encountering for, if and other loops or branches, single letter names are recommended to identify parameters and return values
* It is recommended to use words to name method, interface, type, and package
* The package name is also part of the naming, please use it as much as possible
* Use a consistent naming style

## File naming guidelines
* All lowercase
* Avoid underscores (_) except for unit test
* The file name should not be too long

## Variable naming convention reference
* Initial lowercase
* Hump naming
* See the name to know the meaning, avoid pinyin instead of English
* It is not recommended including an underscore (_)
* It is not recommended including numbers

**Scope of application**
* Local variables
* Function parameter output, input parameter

## Function and constant naming convention
* Camel case naming
* The first letter of the exported must be capitalized
* The first letter must be lowercase if it cannot be exported
* Avoid the combination of all uppercase and underscore (_)


> [!TIP]
> If it is a go-zero code contribution, you must strictly follow this naming convention


# Reference
* [Practical Go: Real world advice for writing maintainable Go programs](https://dave.cheney.net/practical-go/presentations/gophercon-singapore-2019.html#_simplicity)
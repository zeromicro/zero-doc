# Development Rules
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

In actual business development, in addition to improving business development efficiency, shortening business development cycles, and ensuring high performance and high availability indicators for online business, good programming habits are also one of the basic qualities of a developer. In this chapter,

We will introduce the coding standards in go-zero. This chapter is an optional chapter. The content is for communication and reference only. This chapter will explain from the following subsections:

* [Naming Rules](naming-spec.md)
* [Route Rules](route-naming-spec.md)
* [Coding Rules](coding-spec.md)

## Three principles of development

### Clarity
The author quoted a quote from `Hal Abelson and Gerald Sussman`:
> Programs must be written for people to read, and only incidentally for machines to execute

### Simplicity
> Simplicity is prerequisite for reliability

`Edsger W. Dijkstra` believes that: the prerequisite for reliability is simplicity. We have all encountered in actual development. What is this code written and what it wants to accomplish. Developers don’t understand this code, so they don’t know. How to maintain, this brings complexity, the more complex the program, the harder it is to maintain, and the harder it is to maintain, the program becomes more and more complicated. Therefore, the first thing you should think of when encountering a program becoming complicated is - Refactoring, refactoring will redesign the program and make the program simple.

### Productivity）
In the go-zero team, this topic has always been emphasized. The productivity of developers is not how many lines of code you have written and how many module developments you have completed, but we need to use various effective ways to take advantage of the limited Time to complete the development to maximize the efficiency, and the birth of Goctl was officially to increase productivity,
Therefore, I very much agree with this development principle.


# Go-Zero Features
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

go-zero is a web and rpc framework that integrates various engineering practices. It has the following main features:

* Powerful tool support, as little code writing as possible
* Minimalist interface
* Fully compatible with net.http
* Support middleware for easy expansion
* High performance
* Fault-oriented programming, flexible design
* Built-in service discovery, load balancing
* Built-in current limiting, fusing, load reduction, and automatic triggering, automatic recovery
* API parameter automatic verification
* Timeout cascade control
* Automatic cache control
* Link tracking, statistical alarm, etc.
* High concurrency support, stably guaranteeing daily traffic peaks during the epidemic

As shown in the figure below, we have ensured the high availability of the overall service from multiple levels:

![resilience](https://raw.githubusercontent.com/zeromicro/zero-doc/main/doc/images/resilience.jpg)
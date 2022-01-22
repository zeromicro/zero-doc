---
sidebar_position: 4
---

# Distributed Transaction Support

### Demand Scenarios

In microservices architecture, when we need to ensure data consistency across services, the original database transaction is not able to cope with the cross-library and cross-service multiple operations in a single transaction. There are many application scenarios like this, and we can list many of them.
* Cross-bank transfer scenario, where the data is not in one database, but you need to ensure that the balance deduction and balance increase either succeed or fail at the same time
* Posting articles and then updating statistics such as the total number of articles. Where publishing articles and updating statistics are usually not in one microservice
* The order system after microservicing
* Traveling requires booking several tickets at the same time in a third-party system

In the face of these scenarios that cannot be solved by local transactions, we need a distributed transaction solution to ensure the consistency of updated data across services and databases.

### Solution

go-zero and [dtm](https://github.com/dtm-labs/dtm) have joined forces to introduce a minimalist solution for seamless access to dtm in go-zero, the first microservice framework in the go ecosystem to provide distributed transaction capabilities. The solution has the following features.
* dtm services can be directly registered to go-zero's registry through configuration
* go-zero can access the dtm server in the built-in target format
* dtm can recognize go-zero's target format and dynamically access the services in go-zero

For detailed access methods, see the dtm documentation: [go-zero support](https://dtm.pub/ref/gozero.html)

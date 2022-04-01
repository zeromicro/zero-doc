# Distributed Transaction

## Application Scenario
In a microservices architecture, when we need to ensure data consistency across services, the local database transactions are overwhelmed and cannot put multiple operations across databases and services into a single transaction. There are many such scenarios and we can list many of them.
* Order systems: need to ensure that order creation and stock deduction either both succeeded or both rolled back.
* Inter-bank transfer scenarios: the data is not in one database, but you need to ensure that the balance deduction and balance increase either both succeeded or both failed.
* Travel booking scenario: several tickets need to be booked in the third-party system, either all succeeded or all cancelled.

For these scenarios that cannot be solved by local transactions, we need a distributed transaction solution to ensure consistency of data updates across services and databases.

## Solution
go-zero and [dtm](https://github.com/dtm-labs/dtm) have cooperated deeply to introduce an elegant solution that seamlessly accesses dtm in go-zero. The solution has the following features.
* dtm services can be directly registered to go-zero's registry through configuration
* go-zero is able to access the dtm server with a built-in target format
* dtm can recognise go-zero's target format and dynamically access services in go-zero

For detailed access, see the dtm documentation: [go-zero support](https://en.dtm.pub/ref/gozero.html)

## More application scenarios
dtm can address not only the above distributed transaction scenarios, but also many more scenarios related to data consistency, including
* Database and cache consistency: dtm's two-phase messages can guarantee atomicity for database update operations, and cache update/delete operations
* Flash-sales system: dtm ensures that the number of orders created in a flash-sales scenario is exactly the same as the number of stock deductions, without the need for subsequent manual calibration
* Multiple storage combinations: dtm already supports multiple storage such as database, Redis, Mongo, etc., which can be combined into one global transaction to ensure data consistency

For more information on dtm's capabilities and presentation, see [dtm](https://github.com/dtm-labs/dtm)
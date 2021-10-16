# Development Flow
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

The development process here is not a concept with our actual business development process. The definition here is limited to the use of go-zero, that is, the development details at the code level.

## Development Flow
* Goctl environment preparation [1]
* Database Design
* Business development
* New Construction
* Create service catalog
* Create service type (api/rpc/rmq/job/script)
* Write api and proto files
* Code generation
* Generate database access layer code model
* Configuration config, yaml change
* Resource dependency filling (ServiceContext)
* Add middleware
* Business code filling
* Error handling

> [!TIP]
> [1] [goctl environment](concept-introduction.md)

## Development Tools
* Visual Studio Code
* Goland (recommended)
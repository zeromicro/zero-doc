# API directory introduction

> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

```text
.
├── etc
│   └── greet-api.yaml              // yaml configuration file
├── go.mod                          // go module file
├── greet.api                       // api interface description language file
├── greet.go                        // main function entry
└── internal                        
    ├── config  
    │   └── config.go               // configuration declaration type
    ├── handler                     // routing and handler forwarding
    │   ├── greethandler.go
    │   └── routes.go
    ├── logic                       // business logic
    │   └── greetlogic.go
    ├── middleware                  // middleware file
    │   └── greetmiddleware.go
    ├── svc                         // the resource pool that logic depends on
    │   └── servicecontext.go
    └── types                       // The struct of request and response is automatically generated according to the api, and editing is not recommended
        └── types.go
```
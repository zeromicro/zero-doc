# Summary of online communication issues on October 3,2020
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

- Go-zero applicable scenarios
  - I hope to talk about the application scenarios and the advantages of each scenario
    - Highly concurrent microservice system
    - Support tens of millions of daily activities, millions of QPS
    - Complete microservice governance capabilities
    - Support custom middleware
    - Well managed database and cache
    - Effectively isolate faults
  - Monolithic system with low concurrency
    - This kind of system can directly use the api layer without rpc service
  - Use scenarios and use cases of each function
    - Limiting
    - Fuse
    - Load reduction
    - time out
    - Observability
- The actual experience of go-zero
  - The service is stable
  - Front-end and back-end interface consistency, one api file can generate front-end and back-end code
  - Less specification and less code means less bugs
  - Eliminate api documents, greatly reducing communication costs
  - The code structure is completely consistent, easy to maintain and take over
- Project structure of microservices, CICD processing of monorepo

```
  bookstore
  ├── api
  │   ├── etc
  │   └── internal
  │       ├── config
  │       ├── handler
  │       ├── logic
  │       ├── svc
  │       └── types
  └── rpc
  ├── add
  │   ├── adder
  │   ├── etc
  │   ├── internal
  │   │   ├── config
  │   │   ├── logic
  │   │   ├── server
  │   │   └── svc
  │   └── pb
  ├── check
  │   ├── checker
  │   ├── etc
  │   ├── internal
  │   │   ├── config
  │   │   ├── logic
  │   │   ├── server
  │   │   └── svc
  │   └── pb
  └── model
```

The CI of the mono repo is made through gitlab, and the CD uses jenkins
CI is as strict as possible, such as -race, using tools such as sonar
CD has development, testing, pre-release, grayscale and formal clusters
If it is in grayscale at 6 p.m. and there is no fault, it will automatically synchronize to the official cluster at 10 the next day
The formal cluster is divided into multiple k8s clusters, which can effectively prevent a single cluster from failing, just remove it directly, and the cluster upgrade is better
- How to deploy and how to monitor?
  - The full amount of K8S is automatically packaged into a docker image through jenkins, and the tag is packaged according to the time, so that you can see which day of the image is at a glance
  - As mentioned above, pre-release -> grayscale -> formal
  - Prometheus+ self-built dashboard service
  - Detect service and request exceptions based on logs
- If you plan to change the go-zero framework to refactor your business, how can you make the online business stable and safe for users to switch without feeling? In addition, how to divide the service under consultation?
  - Gradually replace, from outside to inside, add a proxy to proofread, you can switch after proofreading a week
  - If there is a database reconstruction, you need to do a good job of synchronizing the old and the new
  - Service division is based on business, following the principle of coarse to fine, avoiding one api and one microservice
  - Data splitting is particularly important for microservices. The upper layer is easy to split, and the data is difficult to split. As far as possible, ensure that the data is split according to the business
- Service discovery
   - Service discovery etcd key design
      - Service key + timestamp, the probability of timestamp conflict in the number of service processes is extremely low, ignore it
   - etcd service discovery and management, exception capture and exception handling
     - Why k8s also uses etcd for service discovery, because the refresh of dns is delayed, resulting in a large number of failures in rolling updates, and etcd can achieve completely lossless updates
     - The etcd cluster is directly deployed in the k8s cluster, because there are multiple formal clusters, clusters are single-pointed and registered to avoid confusion
     - Automatically detect and refresh for etcd abnormalities or leader switching. When etcd has abnormalities that cannot be recovered, the service list will not be refreshed to ensure that the services are still available
- Cache design and use cases
  - Distributed multiple redis clusters, dozens of largest online clusters provide caching services for the same service
  - Seamless expansion and contraction
  - There is no cache without expiration time to avoid a large amount of infrequently used data occupying resources, the default is one week
  - Cache penetration, no data will be cached for one minute for a short period of time to avoid the system crashing due to interface brushing or a large number of non-existent data requests
  - Cache breakdown, a process will only refresh the same data once, avoiding a large number of hot data being loaded at the same time
  - Cache avalanche, automatically jitter the cache expiration time, with a standard deviation of 5%, so that the expiration time of a week is distributed within 16 hours, effectively preventing avalanches
  - Our online database has a cache, otherwise it will not be able to support massive concurrency
  - Automatic cache management has been built into go-zero, and code can be automatically generated through goctl
- Can you explain the design ideas of middleware and interceptor？

  - Onion model
  - This middleware processes, such as current limiting, fusing, etc., and then decides whether to call next
  - next call
  - Process the return result of the next call
- How to implement the transaction processing of microservices, the design and implementation of gozero distributed transactions, and what good middleware recommendations are there?
  - 2PC, two-phase submission
  - TCC, Try-Confirm-Cancel
  - Message queue, maximum attempt
  - Manual compensation
- How to design better multi-level goroutine exception capture？
  - Microservice system request exceptions should be isolated, and a single exception request should not crash the entire process
  - go-zero comes with RunSafe/GoSafe to prevent a single abnormal request from causing the process to crash
  - Monitoring needs to keep up to prevent abnormal excess without knowing it
  - The contradiction between fail fast and fault isolation
- Generation and use of k8s configuration (gateway, service, slb)
  - K8s yaml file is automatically generated internally, which is too dependent on configuration and not open source
  - I plan to add a k8s configuration template to the bookstore example
  - slb->nginx->nodeport->api gateway->rpc service
- Gateway current limiting, fusing and load reduction
  - There are two types of current limiting: concurrency control and distributed current limiting
  - Concurrency control is used to prevent instantaneous excessive requests and protect the system from being overwhelmed
  - Distributed current limit is used to configure different quotas for different services
  - Fuse is to protect dependent services. When a service has a large number of exceptions, the caller should protect it so that it has a chance to return to normal and also achieve the effect of fail fast
  - Downloading is to protect the current process from exhausting its resources and fall into complete unavailability, ensuring that the maximum amount of requests that can be carried is served as well as possible
  - Load reduction and k8s can effectively protect k8s expansion, k8s expansion in minutes, go-zero load reduction in seconds
- Introduce useful components in core, such as timingwheel, etc., and talk about design ideas
  - Bloom filter
  - In-process cache
  - RollingWindow
  - TimingWheel
  - Various executors
  - fx package, map/reduce/filter/sort/group/distinct/head/tail...
  - Consistent hash implementation
  - Distributed current limiting implementation
  - mapreduce, with cancel ability
  - There are a lot of concurrency tools in the syncx package
- How to quickly add a kind of rpc protocol support, change the cross-machine discovery to the local node adjustment, and turn off the complex filter and load balancing functions
  - go-zero has a relatively close relationship with grpc, and it did not consider supporting protocols other than grpc at the beginning of the design
  - If you want to increase it, you can only fork out and change it.
  - You can use the direct scheme directly by adjusting the machine
  - Why remove filter and load balancing? If you want to go, fork is changed, but there is no need
- The design and implementation ideas of log and monitoring and link tracking, it is best to have a rough diagram
  - Log and monitoring We use prometheus, customize the dashboard service, bundle and submit data (every minute)
  - Link tracking can see the calling relationship and automatically record the trace log
![](https://lh5.googleusercontent.com/PBRdYmRs22xEH1gjNkQnoHuB5WFBva10oKCm61A6G23xvi28u95Bwq-qTc_WVV-PihzAHyLpAKkBtbtzK8v9Kjtrp3YBZqGiTSXhHJHwf7CAv5K9AqBSc1CZuV0u3URCDVP8r1RD0PY#align=left&display=inline&height=658&margin=%5Bobject%20Object%5D&originHeight=658&originWidth=1294&status=done&style=none&width=1294)
- Is there any pooling technique useful for the go-zero framework? If so, in which core code can you refer to
  - Generally do not need to optimize in advance, over-optimization is a taboo
  - Core/syncx/pool.go defines a general pooling technology with expiration time
- Go-zero uses those performance test method frameworks, is there a code reference? You can talk about ideas and experience
  - go benchmark
  - Stress testing can be scaled up according to the estimated ratio by using existing business log samples
  - The pressure test must be pressured until the system cannot be carried, see where the first bottleneck is, and then pressure again after the change, and cycle
- Talk about the abstract experience and experience of the code
   - Don’t repeat yourself
     - You may not need it. Before, business developers often asked me if I could add this function or that function. I usually ask the deep-level purpose carefully. In many cases, I find that this function is redundant, and it is the best practice to not need it.
     - Martin Fowler proposed the principle of abstracting after three occurrences. Sometimes some colleagues will ask me to add a function to the framework. After I think about it, I often answer this. You write it in the business layer first. If there is a need in other places, you will tell me again, and it will appear three times. I will consider integrating into the framework
     - A file should only do one thing as much as possible, each file should be controlled within 200 lines as much as possible, and a function should be controlled within 50 lines as much as possible, so that you can see the entire function without scrolling
     - Need the ability to abstract and refine, think more, often look back and think about the previous architecture or implementation
- Will you publish a book on the go-zero framework from design to practice? What is the future development plan of the framework?
  - There is no book publishing plan, and a good framework is the most important
  - Continue to focus on engineering efficiency
  - Improve service governance capabilities
  - Help business development land as quickly as possible

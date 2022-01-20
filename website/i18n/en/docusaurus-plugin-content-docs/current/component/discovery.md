---
sidebar_position: 8
---

# Discovery

### What is Service Register Discovery？

For students who are involved in microservices, the concepts of service registration and service discovery should not be too unfamiliar.

Simply put, when Service A needs to rely on Service B, we need to tell Service A where to invoke Service B. This is the problem to be solved by service registration and discovery.

![discovery](/img/discovery.png)

- Service B registers itself with the Service Registry, called Service Registration
- Service A's discovery of Service B's node information from Service Registry is called Service Discovery

### Service Register

Service registration is for the server side and is required after the service is started and is divided into several parts.

- Start-up registration
- Timed renewal
- Withdrawal

#### Start Register

When a service node is up, it needs to register itself to the `Service Registry` to make it easy for other nodes to discover itself. The registration needs to be done when the service is up and ready to accept requests, and an expiration date is set to prevent the process from being accessed even after an abnormal exit.

#### Scheduled Renewal

Scheduled renewals are equivalent to `keep alive`, telling the `Service Registry` periodically that it is still alive and can continue to serve.

#### Withdrawal

When the process exits, we should actively go to deregister information to facilitate the caller to distribute the request to another node in time. Meanwhile, go-zero ensures that even if a node exits without active deregistration by adaptive load balancing, the node can be taken off in time.

### Service Discovery

Service discovery is for the calling end and generally falls into two categories of issues.

- Stock acquisition
- Incremental Listening

There is also a common engineering problem of

- Responding to service discovery failures

When a service discovery service (such as etcd, consul, nacos, etc.) goes down, we do not modify the list of `endpoints` that we have already acquired, so that we can better ensure that the services that depend on etcd, etc., can still interact normally after they go down.

#### Stock Acquisition

![get data](/img/get-data.png)

When `Service A` starts, it needs to get the list of existing nodes of `Service B` from `Service Registry`: `Service B1`, `Service B2`, `Service B3`, and then select the appropriate nodes to send requests according to its own load balancing algorithm.

#### Incremental Listening

The above diagram already has `Service B1`, `Service B2`, `Service B3`, if `Service B4` is started, then we need to notify `Service A` that there is a new node. As shown in the figure.

![new node](/img/new-node.png)

#### Responding to service discovery failures

For the service caller, we all cache a list of available nodes in memory. Whether we use `etcd`, `consul` or `nacos`, we may face service discovery cluster failures, take etcd as an example, when we encounter etcd failure, we need to freeze the node information of Service B without changing it, we must not empty the node information at this time, once it is empty, we cannot get it, and at this time, the nodes of Service B nodes are likely to be normal, and go-zero will automatically isolate and restore the failed nodes.

![discovery trouble](/img/discovery-trouble.png)

The basic principle of service registration and service discovery is roughly the same, but of course it is more complicated to implement, so let's take a look at what service discovery methods are supported in `go-zero`.

### go-zero's internal service discovery

`go-zero` supports three service discovery methods by default:

- Direct Connect
- etcd-based service discovery
- Service discovery based on kubernetes endpoints

#### Direct connection

Direct connection is the simplest way, when our service is simple enough, such as a single machine can carry our business, we can directly use only this way.

![direct connection](/img/direct-connection.png)

Just specify `endpoints` directly in the `rpc` configuration file, e.g.

```go

Rpc:
  Endpoints:
  - 192.168.0.111:3456
  - 192.168.0.112:3456

````

The `zrpc` caller will then allocate the load to both nodes, and when one of the nodes has a problem `zrpc` will be automatically removed, and the load will be allocated again when the node recovers.

The disadvantage of this approach is that the nodes cannot be added dynamically, and each time a new node is added, the caller's configuration needs to be modified and restarted.

#### etcd-based service discovery

Once we have a certain scale of services, because a service may be dependent on many services, we need to be able to dynamically add and remove nodes without having to modify many caller configurations and restart them.

Common service discovery schemes are `etcd`, `consul`, `nacos`, etc.

![discovery etcd](/img/discovery-etcd.png)

`go-zero` has a built-in service discovery scheme based on `etcd`, which is used as follows.

```go

Rpc:
  Etcd:
     Hosts:
     - 192.168.0.111:2379
     - 192.168.0.112:2379
     - 192.168.0.113:2379
     Key: user.rpc

```

- Hosts is the etcd cluster address
- Key is the key that the service is registered with

#### Kubernetes Endpoints-based Service Discovery

If our services are deployed on a `Kubernetes` cluster, Kubernetes itself manages the cluster state through its own `etcd`, and all services register their node information to `Endpoints` objects, so we can directly give the `deployment` permission to read the cluster's ` Endpoints` object to get the node information.

![discovery k8s](/img/discovery-k8s.png)

- Each `Pod` of `Service B` registers itself to the `Endpoints` of the cluster when it starts
- Each `Pod` of `Service A` can get the node information of `Service B` from the `Endpoints` of the cluster when it starts
- When the node of `Service B` changes, `Service A` can sense it through the `Endpoints` of the `watch` cluster

Before this mechanism can work, we need to configure the `pod` within the current `namespace` to have access to the cluster `Endpoints`, where there are three concepts.

- ClusterRole
    - Defines cluster-wide permission roles, not controlled by namespace
- ServiceAccount
    - Defines the namespace-wide service account
- ClusterRoleBinding
    - Bind the defined ClusterRole to the ServiceAccount of different namespaces
    
The specific Kubernetes configuration file can be found here, where namespace is modified as needed.

Note: Remember to check if these configurations are in place when you start up and don't have access to Endpoints :)

zrpc's `Kubernetes Endpoints` based service discovery is used as follows.

```go

Rpc:
  Target: k8s://mynamespace/myservice:3456

```

where

- `mynamespace`: the `namespace` where the invoked `rpc` service is located
- `myservice`: the name of the called `rpc` service
- `3456`: the port of the called `rpc` service

Be sure to add `serviceAccountName` when creating the `deployment` profile to specify which `ServiceAccount` to use, as in the following example.

```go

apiVersion: apps/v1
kind: Deployment
metadata:
  name: alpine-deployment
  labels:
    app: alpine
spec:
  replicas: 1
  selector:
    matchLabels:
      app: alpine
  template:
    metadata:
      labels:
        app: alpine
    spec:
      serviceAccountName: endpoints-reader
      containers:
      - name: alpine
        image: alpine
        command:
        - sleep
        - infinity

```

Note that `serviceAccountName` specifies which `ServiceAccount` is used for the `pod` created by the `deployment`.

After both `server` and `client` are deployed to the `Kubernetes` cluster, you can restart all `server` nodes on a rolling basis with the following command

```go

kubectl rollout restart deploy -n adhoc server-deployment

```

Use the following command to view the `client` node log.

```go

kubectl -n adhoc logs -f deploy/client-deployment --all-containers=true

```

You can see that our service discovery mechanism follows the changes to the `server` node perfectly and there are no abnormal requests during the service update.

:::tip

The full code example is available at https://github.com/zeromicro/zero-examples/tree/main/discovery/k8s

:::



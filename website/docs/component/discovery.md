---
sidebar_position: 8
---

# 服务发现

### 什么是服务注册发现？

对于搞微服务的同学来说，服务注册、服务发现的概念应该不会太陌生。

简单来说，当服务A需要依赖服务B时，我们就需要告诉服务A，哪里可以调用到服务B，这就是服务注册发现要解决的问题。

![discovery](/img/discovery.png)

- Service B 把自己注册到 Service Registry 叫做 服务注册
- Service A 从 Service Registry 发现 Service B 的节点信息叫做 服务发现

### 服务注册

服务注册是针对服务端的，服务启动后需要注册，分为几个部分：

- 启动注册
- 定时续期
- 退出撤销

#### 启动注册

当一个服务节点起来之后，需要把自己注册到 `Service Registry` 上，便于其它节点来发现自己。注册需要在服务启动完成并可以接受请求时才会去注册自己，并且会设置有效期，防止进程异常退出后依然被访问。

#### 定时续期

定时续期相当于 `keep alive`，定期告诉 `Service Registry` 自己还在，能够继续服务。

#### 退出撤销

当进程退出时，我们应该主动去撤销注册信息，便于调用方及时将请求分发到别的节点。同时，go-zero 通过自适应的负载均衡来保证即使节点退出没有主动注销，也能及时摘除该节点。

### 服务发现

服务发现是针对调用端的，一般分为两类问题：

- 存量获取
- 增量侦听

还有一个常见的工程问题是

- 应对服务发现故障

当服务发现服务（比如 etcd, consul, nacos等）出现问题的时候，我们不要去修改已经获取到的 `endpoints` 列表，从而可以更好的确保 etcd 等宕机后所依赖的服务依然可以正常交互。

#### 存量获取

![get data](/img/get-data.png)

当 `Service A` 启动时，需要从 `Service Registry` 获取 `Service B` 的已有节点列表：`Service B1`, `Service B2`, `Service B3`，然后根据自己的负载均衡算法来选择合适的节点发送请求。

#### 增量侦听

上图已经有了 `Service B1`, `Service B2`, `Service B3`，如果此时又启动了 `Service B4`，那么我们就需要通知 `Service A` 有个新增的节点。如图：

![new node](/img/new-node.png)

#### 应对服务发现故障

对于服务调用方来说，我们都会在内存里缓存一个可用节点列表。不管是使用 `etcd`，`consul` 或者 `nacos` 等，我们都可能面临服务发现集群故障，以 etcd 为例，当遇到 etcd 故障时，我们就需要冻结 Service B 的节点信息而不去变更，此时一定不能去清空节点信息，一旦清空就无法获取了，而此时 Service B 的节点很可能都是正常的，并且 go-zero 会自动隔离和恢复故障节点。

![discovery trouble](/img/discovery-trouble.png)

服务注册、服务发现的基本原理大致如此，当然实现起来还是比较复杂的，接下来我们一起看看 `go-zero` 里支持哪些服务发现的方式。

### go-zero 之内置服务发现

`go-zero` 默认支持三种服务发现方式：

- 直连
- 基于 etcd 的服务发现
- 基于 kubernetes endpoints 的服务发现

#### 直连

直连是最简单的方式，当我们的服务足够简单时，比如单机即可承载我们的业务，我们可以直接只用这种方式。

![direct connection](/img/direct-connection.png)

在 `rpc` 的配置文件里直接指定 `endpoints` 即可，比如：

```go

Rpc:
  Endpoints:
  - 192.168.0.111:3456
  - 192.168.0.112:3456

````

`zrpc` 调用端就会分配负载到这两个节点上，其中一个节点有问题时 `zrpc` 会自动摘除，等节点恢复时会再次分配负载。

这个方法的缺点是不能动态增加节点，每次新增节点都需要修改调用方配置并重启。

#### 基于 etcd 的服务发现

当我们的服务有一定规模之后，因为一个服务可能会被很多个服务依赖，我们就需要能够动态增减节点，而无需修改很多的调用方配置并重启。

常见的服务发现方案有 `etcd`, `consul`, `nacos` 等。

![discovery etcd](/img/discovery-etcd.png)

`go-zero` 内置集成了基于 `etcd` 的服务发现方案，具体使用方法如下：

```go

Rpc:
  Etcd:
     Hosts:
     - 192.168.0.111:2379
     - 192.168.0.112:2379
     - 192.168.0.113:2379
     Key: user.rpc

```

- Hosts 是 etcd 集群地址
- Key 是服务注册上去的 key

#### 基于 Kubernetes Endpoints 的服务发现

如果我们的服务都是部署在 `Kubernetes` 集群上的话，Kubernetes 本身是通过自带的 `etcd` 管理集群状态的，所有的服务都会把自己的节点信息注册到 `Endpoints` 对象，我们可以直接给 `deployment` 权限去读取集群的 `Endpoints` 对象即可获得节点信息。

![discovery k8s](/img/discovery-k8s.png)

- `Service B` 的每个 `Pod` 启动时，会将自己注册到集群的 `Endpoints` 里
- `Service A` 的每个 `Pod` 启动时，可以从集群的 `Endpoints` 里获取 `Service B` 的节点信息
- 当 `Service B` 的节点发生改变时，`Service A` 可以通过 `watch` 集群的 `Endpoints` 感知到

在这个机制工作之前，我们需要配置好当前 `namespace` 内 `pod` 对集群 `Endpoints` 访问权限，这里有三个概念：

- ClusterRole
    - 定义集群范围的权限角色，不受 namespace 控制
- ServiceAccount
    - 定义 namespace 范围内的 service account
- ClusterRoleBinding
    - 将定义好的 ClusterRole 和不同 namespace 的 ServiceAccount 进行绑定
    
具体的 Kubernetes 配置文件可以参考 这里，其中 namespace 按需修改。

注意：当启动时报没有权限获取 Endpoints 时记得检查这些配置有没落实 :)

zrpc 的基于 `Kubernetes Endpoints` 的服务发现使用方法如下：

```go

Rpc:
  Target: k8s://mynamespace/myservice:3456

```

其中：

- `mynamespace`：被调用的 `rpc` 服务所在的 `namespace`
- `myservice`：被调用的 `rpc` 服务的名字
- `3456`：被调用的 `rpc` 服务的端口

在创建 `deployment` 配置文件时一定要加上 `serviceAccountName` 来指定使用哪个 `ServiceAccount`，示例如下：

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

注意其中 `serviceAccountName` 指定该 `deployment` 创建出来的 `pod` 用哪个 `ServiceAccount`。

`server` 和 `client` 都部署到 `Kubernetes` 集群里之后可以通过以下命令滚动重启所有 `server` 节点

```go

kubectl rollout restart deploy -n adhoc server-deployment

```

利用如下命令查看 `client` 节点日志：

```go

kubectl -n adhoc logs -f deploy/client-deployment --all-containers=true

```

可以看到我们的服务发现机制完美跟进了 `server` 节点的变化，并且在服务更新期间没有出现异常请求。

:::tip

完整代码示例见 https://github.com/zeromicro/zero-examples/tree/main/discovery/k8s

:::


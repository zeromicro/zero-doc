# 其他命令
* goctl docker
* goctl kube

## goctl docker
`goctl docker` 可以极速生成一个 Dockerfile，帮助开发/运维人员加快部署节奏，降低部署复杂度。

### 准备工作
* docker安装

### Dockerfile 额外注意点
* 选择最简单的镜像：比如alpine，整个镜像5M左右
* 设置镜像时区
```shell
RUN apk add --no-cache tzdata
ENV TZ Asia/Shanghai
```

### 多阶段构建
* 第一阶段构建出可执行文件，确保构建过程独立于宿主机
* 第二阶段将第一阶段的输出作为输入，构建出最终的极简镜像

### Dockerfile编写过程
* 首先安装 goctl 工具
```shell
$ GO111MODULE=on GOPROXY=https://goproxy.cn/,direct go get -u github.com/zeromicro/go-zero/tools/goctl
```

* 在 greet 项目下创建一个 hello 服务
```shell
$ goctl api new hello
```

文件结构如下：
```text
greet
├── go.mod
├── go.sum
└── service
    └── hello
        ├── Dockerfile
        ├── etc
        │   └── hello-api.yaml
        ├── hello.api
        ├── hello.go
        └── internal
            ├── config
            │   └── config.go
            ├── handler
            │   ├── hellohandler.go
            │   └── routes.go
            ├── logic
            │   └── hellologic.go
            ├── svc
            │   └── servicecontext.go
            └── types
                └── types.go
```
* 在 `hello` 目录下一键生成 `Dockerfile`
```shell
$ goctl docker -go hello.go
```
Dockerfile 内容如下：
```shell
    FROM golang:alpine AS builder
    LABEL stage=gobuilder
    ENV CGO_ENABLED 0
    ENV GOOS linux
    ENV GOPROXY https://goproxy.cn,direct
    WORKDIR /build/zero
    ADD go.mod .
    ADD go.sum .
    RUN go mod download
    COPY . .
    COPY service/hello/etc /app/etc
    RUN go build -ldflags="-s -w" -o /app/hello service/hello/hello.go
    FROM alpine
    RUN apk update --no-cache
    RUN apk add --no-cache ca-certificates
    RUN apk add --no-cache tzdata
    ENV TZ Asia/Shanghai
    WORKDIR /app
    COPY --from=builder /app/hello /app/hello
    COPY --from=builder /app/etc /app/etc
    CMD ["./hello", "-f", "etc/hello-api.yaml"]
```
* 在 `hello` 目录下 `build` 镜像
```shell
$ docker build -t hello:v1 -f service/hello/Dockerfile .
```

* 查看镜像
```shell
hello v1 5455f2eaea6b 7 minutes ago 18.1MB
```

可以看出镜像大小约为18M。
* 启动服务
```shell
$ docker run --rm -it -p 8888:8888 hello:v1
```
* 测试服务
```shell
$ curl -i http://localhost:8888/from/you
```
```text
HTTP/1.1 200 OK
Content-Type: application/json
Date: Thu, 10 Dec 2020 06:03:02 GMT
Content-Length: 14
{"message":""}
```

### goctl docker总结
goctl 工具极大简化了 Dockerfile 文件的编写，提供了开箱即用的最佳实践，并且支持了模板自定义。

## goctl kube

`goctl kube`提供了快速生成一个 `k8s` 部署文件的功能，可以加快开发/运维人员的部署进度，减少部署复杂度。

### 头疼编写 K8S 部署文件？


- `K8S yaml` 参数很多，需要边写边查？
- 保留回滚版本数怎么设？
- 如何探测启动成功，如何探活？
- 如何分配和限制资源？
- 如何设置时区？否则打印日志是 GMT 标准时间
- 如何暴露服务供其它服务调用？
- 如何根据 CPU 和内存使用率来配置水平伸缩？



首先，你需要知道有这些知识点，其次要把这些知识点都搞明白也不容易，再次，每次编写依然容易出错！

## 创建服务镜像
为了演示，这里我们以 `redis:6-alpine` 镜像为例。

## 完整 K8S 部署文件编写过程

- 首先安装 `goctl` 工具

```shell
$ GO111MODULE=on GOPROXY=https://goproxy.cn/,direct go get -u github.com/zeromicro/go-zero/tools/goctl
```

- 一键生成 K8S 部署文件

```shell
$ goctl kube deploy -name redis -namespace adhoc -image redis:6-alpine -o redis.yaml -port 6379
```
生成的 `yaml` 文件如下：


```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: adhoc
  labels:
    app: redis
spec:
  replicas: 3
  revisionHistoryLimit: 5
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:6-alpine
        lifecycle:
          preStop:
            exec:
              command: ["sh","-c","sleep 5"]
        ports:
        - containerPort: 6379
        readinessProbe:
          tcpSocket:
            port: 6379
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          tcpSocket:
            port: 6379
          initialDelaySeconds: 15
          periodSeconds: 20
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 1000m
            memory: 1024Mi
        volumeMounts:
        - name: timezone
          mountPath: /etc/localtime
      volumes:
        - name: timezone
          hostPath:
            path: /usr/share/zoneinfo/Asia/Shanghai
---
apiVersion: v1
kind: Service
metadata:
  name: redis-svc
  namespace: adhoc
spec:
  ports:
    - port: 6379
  selector:
    app: redis
---
apiVersion: autoscaling/v2beta1
kind: HorizontalPodAutoscaler
metadata:
  name: redis-hpa-c
  namespace: adhoc
  labels:
    app: redis-hpa-c
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: redis
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      targetAverageUtilization: 80
---
apiVersion: autoscaling/v2beta1
kind: HorizontalPodAutoscaler
metadata:
  name: redis-hpa-m
  namespace: adhoc
  labels:
    app: redis-hpa-m
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: redis
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: memory
      targetAverageUtilization: 80
```


- 部署服务，如果 `adhoc` namespace 不存在的话，请先通过 `kubectl create namespace adhoc` 创建
```
$ kubectl apply -f redis.yaml
deployment.apps/redis created
service/redis-svc created
horizontalpodautoscaler.autoscaling/redis-hpa-c created
horizontalpodautoscaler.autoscaling/redis-hpa-m created
```

- 查看服务允许状态
```
$ kubectl get all -n adhoc
NAME                         READY   STATUS    RESTARTS   AGE
pod/redis-585bc66876-5ph26   1/1     Running   0          6m5s
pod/redis-585bc66876-bfqxz   1/1     Running   0          6m5s
pod/redis-585bc66876-vvfc9   1/1     Running   0          6m5s
NAME                TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)    AGE
service/redis-svc   ClusterIP   172.24.15.8   <none>        6379/TCP   6m5s
NAME                    READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/redis   3/3     3            3           6m6s
NAME                               DESIRED   CURRENT   READY   AGE
replicaset.apps/redis-585bc66876   3         3         3       6m6s
NAME                                              REFERENCE          TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
horizontalpodautoscaler.autoscaling/redis-hpa-c   Deployment/redis   0%/80%    3         10        3          6m6s
horizontalpodautoscaler.autoscaling/redis-hpa-m   Deployment/redis   0%/80%    3         10        3          6m6s
```


- 测试服务
```
$ kubectl run -i --tty --rm cli --image=redis:6-alpine -n adhoc -- sh
/data # redis-cli -h redis-svc
redis-svc:6379> set go-zero great
OK
redis-svc:6379> get go-zero
"great"
```
### goctl kube 总结
`goctl` 工具极大简化了 K8S yaml 文件的编写，提供了开箱即用的最佳实践，并且支持了模板自定义。

# 猜你想看
* [准备工作](prepare.md)
* [api目录](api-dir.md)
* [api语法](api-grammar.md)
* [api配置](api-config.md)
* [api命令介绍](goctl-api.md)
* [docker介绍](https://www.docker.com)
* [k8s介绍](https://kubernetes.io/zh/docs/home)

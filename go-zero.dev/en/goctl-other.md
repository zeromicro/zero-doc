# More Commands
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

* goctl docker
* goctl kube

## goctl docker
`goctl docker` can quickly generate a Dockerfile to help developers/operations and maintenance personnel speed up the deployment pace and reduce deployment complexity.

### Prepare
* docker install

### Dockerfile note
* Choose the simplest mirror: For example, `alpine`, the entire mirror is about 5M
* Set mirror time zone
```shell
RUN apk add --no-cache tzdata
ENV TZ Asia/Shanghai
```

### Multi-stage build
* Otherwise, an executable file will be built in the first stage of construction to ensure that the build process is independent of the host
* The second stage uses the output of the first stage as input to construct the final minimalist image

### Dockerfile writing process
* First install the goctl tool
```shell
$ GO111MODULE=on GOPROXY=https://goproxy.cn/,direct go get -u github.com/zeromicro/go-zero/tools/goctl
```

* Create a hello service under the greet project
```shell
$ goctl api new hello
```

The file structure is as follows:
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
* Generate a `Dockerfile` in the `hello` directory
```shell
$ goctl docker -go hello.go
```
Dockerfile:
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
* To `build` mirror in the `greet` directory
```shell
$ docker build -t hello:v1 -f service/hello/Dockerfile .
```

* View mirror
```shell
hello v1 5455f2eaea6b 7 minutes ago 18.1MB
```

It can be seen that the mirror size is about 18M.
* Start service
```shell
$ docker run --rm -it -p 8888:8888 hello:v1
```
* Test service
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

### goctl docker summary
The goctl tool greatly simplifies the writing of Dockerfile files, provides best practices out of the box, and supports template customization.

## goctl kube

`goctl kube` provides the function of quickly generating a `k8s` deployment file, which can speed up the deployment progress of developers/operations and maintenance personnel and reduce deployment complexity.

### Have a trouble to write K8S deployment files?


- `K8S yaml` has a lot of parameters, need to write and check?
- How to set the number of retained rollback versions?
- How to detect startup success, how to detect live?
- How to allocate and limit resources?
- How to set the time zone? Otherwise, the print log is GMT standard time
- How to expose services for other services to call?
- How to configure horizontal scaling based on CPU and memory usage?



First, you need to know that you have these knowledge points, and secondly, it is not easy to understand all these knowledge points, and again, it is still easy to make mistakes every time you write!

## Create service image
For demonstration, here we take the `redis:6-alpine` image as an example.

## 完整 K8S Deployment file writing process

- First install the `goctl` tool

```shell
$ GO111MODULE=on GOPROXY=https://goproxy.cn/,direct go get -u github.com/zeromicro/go-zero/tools/goctl
```

- One-click generation of K8S deployment files

```shell
$ goctl kube deploy -name redis -namespace adhoc -image redis:6-alpine -o redis.yaml -port 6379
```
The generated `yaml` file is as follows:


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


- Deploy the service, if the `adhoc` namespace does not exist, please create it through `kubectl create namespace adhoc`
```
$ kubectl apply -f redis.yaml
deployment.apps/redis created
service/redis-svc created
horizontalpodautoscaler.autoscaling/redis-hpa-c created
horizontalpodautoscaler.autoscaling/redis-hpa-m created
```

- View service permission status
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


- Test service
```
$ kubectl run -i --tty --rm cli --image=redis:6-alpine -n adhoc -- sh
/data # redis-cli -h redis-svc
redis-svc:6379> set go-zero great
OK
redis-svc:6379> get go-zero
"great"
```
### goctl kube summary
The `goctl` tool greatly simplifies the writing of K8S yaml files, provides best practices out of the box, and supports template customization.

# Guess you wants
* [Prepare](prepare.md)
* [API Directory Structure](api-dir.md)
* [API IDL](api-grammar.md)
* [API Configuration](api-config.md)
* [API Commands](goctl-api.md)
* [Docker](https://www.docker.com)
* [K8s](https://kubernetes.io/docs/home/)

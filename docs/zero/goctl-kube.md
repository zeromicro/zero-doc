# goctl kube

本文介绍如何使用 `goctl` 快速生成一个 `k8s` 部署文件
## 头疼编写 K8S 部署文件？


- `K8S yaml` 参数很多，需要边写边查？
- 保留回滚版本数怎么设？
- 如何探测启动成功，如何探活？
- 如何分配和限制资源？
- 如何设置时区？否则打印日志是 GMT 标准时间
- 如何暴露服务供其它服务调用？
- 如何根据 CPU 和内存使用率来配置水平伸缩？



首先，你需要知道有这些知识点，其次要把这些知识点都搞明白也不容易，再次，每次编写依然容易出错！
## 创建服务镜像


[前一篇文章](https://www.yuque.com/tal-tech/go-zero/zxy2q0) 讲解了如何快速创建自己的服务镜像，不过为了演示，这篇文章我们以 `redis:6-alpine` 镜像为例。
## 完整 K8S 部署文件编写过程


- 首先安装 `goctl` 工具

```bash
GO111MODULE=on GOPROXY=https://goproxy.cn/,direct go get -u github.com/zeromicro/go-zero/tools/goctl
```

- 一键生成 K8S 部署文件

```bash
goctl kube deploy -name redis -namespace adhoc -image redis:6-alpine -o redis.yaml -port 6379
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
## 总结


`goctl` 工具极大简化了 K8S yaml 文件的编写，提供了开箱即用的最佳实践，并且支持了模板自定义。


<Vssue title="goctlkube" />


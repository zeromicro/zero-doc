# 服务端

### 配置说明
在etc目录下有hello.yaml配置文件
ListenOn: 服务侦听在本地8080端口
Etcd：默认本地2379端，key为服务地址对应的key前缀用来标识服务
```shell
Name: hello.rpc
ListenOn: 127.0.0.1:8080
Etcd:
  Hosts:
  - 127.0.0.1:2379
  Key: hello.rpc

```
### 启动Etcd
因为依赖etcd所以需要先在本地启动etcd，etcd的使用请查看相关文档


### 业务逻辑
修改logic下来SayHello方法
```go
func (l *SayHelloLogic) SayHello(in *hello.HelloRequest) (*hello.HelloReply, error) {
	return &hello.HelloReply{
		Message: fmt.Sprintf("hello %s", in.Name),
	}, nil
}
```
### 运行服务
启动服务
```shell
go run hello.go
```
输出如下，表明服务启动成功
```shell
Starting rpc server at 127.0.0.1:8080...
```


### 查看注册
```go
ETCDCTL_API=3 etcdctl get hello.rpc --prefix
```
显示服务已经注册
```go
hello.rpc/7587849401504590084
127.0.0.1:8080
```

<Vssue title="zrpcserver" />

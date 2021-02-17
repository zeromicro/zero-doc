# 客户端



#### 客户端
```go
package main

import (
	"context"
	"fmt"
	"log"

	"hello/hello"

	"github.com/tal-tech/go-zero/core/discov"
	"github.com/tal-tech/go-zero/zrpc"
)

func main() {
	client := zrpc.MustNewClient(zrpc.RpcClientConf{
		Etcd: discov.EtcdConf{
			Hosts: []string{"127.0.0.1:2379"},
			Key:   "hello.rpc",
		},
	})

	client := hello.NewGreeterClient(client.Conn())

	reply, err := client.SayHello(context.Background(), &hello.HelloRequest{Name: "go-zero"})
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(reply.Message)
}

```
运行客户端即可看到输出
```go
hello go-zero
```

<Vssue title="zrpcclient" />

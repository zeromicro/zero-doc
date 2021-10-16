* ### go-zero 分布式定时任务

  

  日常任务开发中，我们会有很多异步、批量、定时、延迟任务要处理，go-zero中有go-queue，推荐使用go-queue去处理，go-queue本身也是基于go-zero开发的，其本身是有两种模式

  - dq : 依赖于beanstalkd，分布式，可存储，延迟、定时设置，关机重启可以重新执行，消息不会丢失，使用非常简单，go-queue中使用了redis setnx保证了每条消息只被消费一次，使用场景主要是用来做日常任务使用
  - kq：依赖于kafka，这个就不多介绍啦，大名鼎鼎的kafka，使用场景主要是做消息队列

  我们主要说一下dq，kq使用也一样的，只是依赖底层不同，如果没使用过beanstalkd，没接触过beanstalkd的可以先google一下，使用起来还是挺容易的。



  etc/job.yaml : 配置文件

  ```yaml
  Name: job
  
  Log:
    ServiceName: job
    Level: info
  
  #dq依赖Beanstalks、redis ，Beanstalks配置、redis配置
  DqConf:
    Beanstalks:
      - Endpoint: 127.0.0.1:7771
        Tube: tube1
      - Endpoint: 127.0.0.1:7772
        Tube: tube2
    Redis:
      Host: 127.0.0.1:6379
      Type: node
  ```

  

  Internal/config/config.go ：解析dq对应etc/*.yaml配置

  ```go
  /**
  * @Description 配置文件
  * @Author Mikael
  * @Email 13247629622@163.com
  * @Date 2021/1/18 12:05
  * @Version 1.0
  **/
  
  package config
  
  import (
  	"github.com/tal-tech/go-queue/dq"
  	"github.com/tal-tech/go-zero/core/service"
  
  )
  
  type Config struct {
  	service.ServiceConf
  	DqConf dq.DqConf
  }
  
  ```

  

  Handler/router.go : 负责注册多任务

  ```go
  /**
  * @Description 注册job
  * @Author Mikael
  * @Email 13247629622@163.com
  * @Date 2021/1/18 12:05
  * @Version 1.0
  **/
  package handler
  
  import (
  	"context"
  	"github.com/tal-tech/go-zero/core/service"
  	"job/internal/logic"
  	"job/internal/svc"
  )
  
  func RegisterJob(serverCtx *svc.ServiceContext,group *service.ServiceGroup)  {
  
  	group.Add(logic.NewProducerLogic(context.Background(),serverCtx))
  	group.Add(logic.NewConsumerLogic(context.Background(),serverCtx))
  
  	group.Start()
  
  }
  ```

  

  ProducerLogic: 其中一个job业务逻辑

  ```go
  /**
  * @Description 生产者任务
  * @Author Mikael
  * @Email 13247629622@163.com
  * @Date 2021/1/18 12:05
  * @Version 1.0
  **/
  package logic
  
  import (
  	"context"
  	"github.com/tal-tech/go-queue/dq"
  	"github.com/tal-tech/go-zero/core/logx"
  	"github.com/tal-tech/go-zero/core/threading"
  	"job/internal/svc"
  	"strconv"
  	"time"
  )
  
  
  
  type Producer struct {
  	ctx    context.Context
  	svcCtx *svc.ServiceContext
  	logx.Logger
  }
  
  func NewProducerLogic(ctx context.Context, svcCtx *svc.ServiceContext) *Producer {
  	return &Producer{
  		ctx:    ctx,
  		svcCtx: svcCtx,
  		Logger: logx.WithContext(ctx),
  	}
  }
  
  func (l *Producer)Start()  {
  
  	logx.Infof("start  Producer \n")
  	threading.GoSafe(func() {
  		producer := dq.NewProducer([]dq.Beanstalk{
  			{
  				Endpoint: "localhost:7771",
  				Tube:     "tube1",
  			},
  			{
  				Endpoint: "localhost:7772",
  				Tube:     "tube2",
  			},
  		})
  		for i := 1000; i < 1005; i++ {
  			_, err := producer.Delay([]byte(strconv.Itoa(i)), time.Second * 1)
  			if err != nil {
  				logx.Error(err)
  			}
  		}
  	})
  }
  
  func (l *Producer)Stop()  {
  	logx.Infof("stop Producer \n")
  }
  
  
  ```

  另外一个Job业务逻辑

  ```go
  /**
  * @Description 消费者任务
  * @Author Mikael
  * @Email 13247629622@163.com
  * @Date 2021/1/18 12:05
  * @Version 1.0
  **/
  package logic
  
  import (
  	"context"
  	"github.com/tal-tech/go-zero/core/logx"
  	"github.com/tal-tech/go-zero/core/threading"
  	"job/internal/svc"
  )
  
  type Consumer struct {
  	ctx    context.Context
  	svcCtx *svc.ServiceContext
  	logx.Logger
  }
  
  func NewConsumerLogic(ctx context.Context, svcCtx *svc.ServiceContext) *Consumer {
  	return &Consumer{
  		ctx:    ctx,
  		svcCtx: svcCtx,
  		Logger: logx.WithContext(ctx),
  	}
  }
  
  func (l *Consumer)Start()  {
  	logx.Infof("start consumer \n")
  
  	threading.GoSafe(func() {
  		l.svcCtx.Consumer.Consume(func(body []byte) {
  			logx.Infof("consumer job  %s \n" ,string(body))
  		})
  	})
  }
  
  func (l *Consumer)Stop()  {
  	logx.Infof("stop consumer \n")
  }
  ```

  

  svc/servicecontext.go

  ```go
  /**
  * @Description 配置
  * @Author Mikael
  * @Email 13247629622@163.com
  * @Date 2021/1/18 12:05
  * @Version 1.0
  **/
  package svc
  
  import (
  	"job/internal/config"
  	"github.com/tal-tech/go-queue/dq"
  )
  
  type ServiceContext struct {
  	Config config.Config
  	Consumer      dq.Consumer
  }
  
  func NewServiceContext(c config.Config) *ServiceContext {
  	return &ServiceContext{
  		Config: c,
  		Consumer: dq.NewConsumer(c.DqConf),
  	}
  }
  
  ```

  

  main.go启动文件

  ```go
  /**
  * @Description 启动文件
  * @Author Mikael
  * @Email 13247629622@163.com
  * @Date 2021/1/18 12:05
  * @Version 1.0
  **/
  package main
  
  import (
  	"flag"
  	"fmt"
  	"github.com/tal-tech/go-zero/core/conf"
  	"github.com/tal-tech/go-zero/core/logx"
  	"github.com/tal-tech/go-zero/core/service"
  	"job/internal/config"
  	"job/internal/handler"
  	"job/internal/svc"
  	"os"
  	"os/signal"
  	"syscall"
  	"time"
  )
  
  
  var configFile = flag.String("f", "etc/job.yaml", "the config file")
  
  func main() {
  	flag.Parse()
  
  	//配置
  	var c config.Config
  	conf.MustLoad(*configFile, &c)
  	ctx := svc.NewServiceContext(c)
  
  	//注册job
  	group := service.NewServiceGroup()
  	handler.RegisterJob(ctx,group)
  
  	//捕捉信号
  	ch := make(chan os.Signal)
  	signal.Notify(ch, syscall.SIGHUP, syscall.SIGQUIT, syscall.SIGTERM, syscall.SIGINT)
  	for {
  		s := <-ch
  		logx.Info("get a signal %s", s.String())
  		switch s {
  		case syscall.SIGQUIT, syscall.SIGTERM, syscall.SIGINT:
  			fmt.Printf("stop group")
  			group.Stop()
  			logx.Info("job exit")
  			time.Sleep(time.Second)
  			return
  		case syscall.SIGHUP:
  		default:
  			return
  		}
  	}
  }
  ```

  #### 常见问题：

  为什么使用`dp`，需要使用`redis`？

  - 因为`beanstalk`是单点服务，无法保证高可用。`dp`可以使用多个单点`beanstalk`服务，互相备份 & 保证高可用。使用`redis`解决重复消费问题。
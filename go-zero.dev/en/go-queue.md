# Queue
> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

In the development of daily tasks, we will have many asynchronous, batch, timing, and delayed tasks to be processed. There is go-queue in go-zero. It is recommended to use go-queue for processing. Go-queue itself is also developed based on go-zero. There are two modes

  - dq : Depends on beanstalkd, distributed, can be stored, delayed, timing settings, shutdown and restart can be re-executed, messages will not be lost, very simple to use, redis setnx is used in go-queue to ensure that each message is only consumed once, usage scenarios Mainly used for daily tasks.
  - kq: Depends on Kafka, so I won’t introduce more about it, the famous Kafka, the usage scenario is mainly to do message queue

  We mainly talk about dq. The use of kq is also the same, but it depends on the bottom layer. If you haven't used beanstalkd, you can google it first. It's still very easy to use.

  

  etc/job.yaml : Configuration file

  ```yaml
  Name: job
  
  Log:
    ServiceName: job
    Level: info
  
  # dq depends on Beanstalks, redis, Beanstalks configuration, redis configuration
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

  

  Internal/config/config.go: Parse dq corresponding `etc/*.yaml` configuration

  ```go
  /**
  * @Description Configuration file
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

  

  Handler/router.go : Responsible for multi-task registration

  ```go
  /**
  * @Description Register job
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

  

  ProducerLogic: One of the job business logic

  ```go
  /**
  * @Description Producer task
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

  Another job business logic

  ```go
  /**
  * @Description Consumer task
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
  * @Description Configuration
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

  

  main.go startup file

  ```go
  /**
  * @Description Startup file
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
  
  	var c config.Config
  	conf.MustLoad(*configFile, &c)
  	ctx := svc.NewServiceContext(c)
  
  	group := service.NewServiceGroup()
  	handler.RegisterJob(ctx,group)
  
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

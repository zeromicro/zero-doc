---
sidebar_position: 7
---

# Load Balancer

### Background

When selecting a load balancing algorithm, we want to meet the following requirements.

- Have partitioning and server room scheduling affinity
    - Choose the node with the lowest load possible each time
    - Select the fastest responsive node possible each time
- No need for manual intervention on failed nodes
    - When a node fails, the load balancing algorithm can automatically isolate the node
    - When a failed node recovers, traffic distribution to that node can be automatically resumed

Translated with www.DeepL.com/Translator (free version)

### The core idea of the algorithm

#### p2c

`p2c` (Pick Of 2 Choices) Choose one of two: Randomly select two nodes among multiple nodes.

`go-zero` in will be randomly selected 3 times, and if the health condition of one of the selected nodes meets the requirement, the selection is interrupted and both nodes are adopted.

#### EWMA

`EWMA` (Exponentially Weighted Moving-Average) Exponential Moving Weighted Average: The weighting factor of each value decreases exponentially over time, and the closer the value is to the current moment, the larger the weighting factor is, reflecting the average value over the most recent period.

- Formula：

![ewma](/img/ewma.png)

- Variable Explanation：
    - Vt: represents the EWMA value of the tth request
    - Vt-1: represents the EWMA value of the t-1st request
    - β: is a constant

#### EWMA Advantages of the algorithm

- Compared to the common algorithm for calculating average values, EWMA does not need to save all the past values, which significantly reduces the amount of computation and storage resources.

- The traditional algorithm for calculating the average is not sensitive to the network time consumption, while EWMA can adjust β by the frequency of requests to quickly monitor the network burr or more reflect the overall average.
    - When the requests are more frequent, it means that the node network load is increasing, and we want to monitor the node processing time (which reflects the node load), we adjust β down accordingly. β is smaller, the EWMA value is closer to this time, and then we can quickly monitor the network burr;
    - When the requests are less frequent, we adjust the β value relatively larger. In this way, the calculated EWMA value is closer to the average value.
    
#### β calculation

The `go-zero` uses the decay function model from Newton's cooling law to calculate the `β` value in the `EWMA` algorithm:

![ewma](/img/β.png)

where `Δt` is the interval between two requests, `e`, `k` are constants

### Implementing a custom load balancer in gRPC

First we need to implement google.golang.org/grpc/balancer/base/base.go/PickerBuilder interface, this interface is when there is a service node update will call the interface's Build method

```go title="grpc-go/balancer/base/base.go" 

type PickerBuilder interface {
    // Build returns a picker that will be used by gRPC to pick a SubConn.
    Build(info PickerBuildInfo) balancer.Picker
}

```

It also implements the google.golang.org/grpc/balancer/balancer.go/Picker interface. This interface mainly implements load balancing, picking a node for requests

```go title="grpc-go/balancer/balancer.go"

type Picker interface {
  Pick(info PickInfo) (PickResult, error)
}

```

Finally, register our implemented load balancer with the load balancing map

### The main logic of go-zero's load balancing implementation

- At each node update, `gRPC` will call the `Build` method, where all the node information is stored in `Build`.

- `gRPC` calls the `Pick` method to fetch nodes when it fetches nodes to process requests. `go-zero` implements the `p2c` algorithm in the `Pick` method to pick the node and calculate the load from the `EWMA` value of the node and return the node with low load for gRPC to use.

- At the end of the request `gRPC` calls the `PickResult.Done` method, in which `go-zero` stores the information about the time spent on this request and calculates the `EWMA` value and saves it for the next request to calculate the load and so on.

### Load Balancing Code Analysis

#### Save all node information of the service

We need to keep information about the time taken by the node to process this request, `EWMA`, etc. `go-zero` has designed the following structure for each node.

```go title="go-zero/zrpc/internal/balancer/p2c/p2c.go"

type subConn struct {
    addr     resolver.Address
    conn     balancer.SubConn
    lag      uint64 // Used to save ewma values
    inflight int64  // Used to keep the total number of requests being processed by the current node
    success  uint64 // Used to identify the health status of this connection over time
    requests int64  // Used to store the total number of requests
    last     int64  // Used to save the last request time, used to calculate the ewma value
    pick     int64  // Save the last selected point in time
}

```

#### `p2cPicker` implements the `balancer.Picker` interface, and `conns` holds information about all nodes of the service

```go title="go-zero/zrpc/internal/balancer/p2c/p2c.go"

type p2cPicker struct {
  conns []*subConn  // Save information about all nodes 
  r     *rand.Rand
  stamp *syncx.AtomicDuration
  lock  sync.Mutex
}

```

#### `gRPC` calls the `Build` method when a node is updated, passing in all the node information, where we save each node information in a subConn structure. Here we save each node information in a subConn structure and merge them together in a `p2cPicker` structure

```go title="go-zero/zrpc/internal/balancer/p2c/p2c.go:42"

func (b *p2cPickerBuilder) Build(info base.PickerBuildInfo) balancer.Picker {
  ......
  var conns []*subConn
  for conn, connInfo := range readySCs {
    conns = append(conns, &subConn{
      addr:    connInfo.Address,
      conn:    conn,
      success: initSuccess,
    })
  }
  return &p2cPicker{
    conns: conns,
    r:     rand.New(rand.NewSource(time.Now().UnixNano())),
    stamp: syncx.NewAtomicDuration(),
  }
}

```

#### Randomly selected node information is divided into three cases here:

The main implementation code is as follows.

```go title="go-zero/zrpc/internal/balancer/p2c/p2c.go:80"

switch len(p.conns) {
  case 0: // No node, return error
    return emptyPickResult, balancer.ErrNoSubConnAvailable
  case 1: // There is a node, return this node directly
    chosen = p.choose(p.conns[0], nil)
  case 2: // There are two nodes, calculate the load and return the node with the lower load
    chosen = p.choose(p.conns[0], p.conns[1])
  default: // There are multiple nodes, p2c picks two nodes, compares the load of these two nodes, and returns the node with the lower load
    var node1, node2 *subConn
    // 3 times random selection of two nodes
    for i := 0; i < pickTimes; i++ {
      a := p.r.Intn(len(p.conns))
      b := p.r.Intn(len(p.conns) - 1)
      if b >= a {
        b++
      }
      node1 = p.conns[a]
      node2 = p.conns[b]
      // If the selected node meets the health requirements this time, break the selection
      if node1.healthy() && node2.healthy() {
        break
      }
    }
    // Compare the load of the two nodes and choose the one with the lower load
    chosen = p.choose(node1, node2)
  }

````

- There is only one service node, which is returned directly for gRPC use

- There are two service nodes, calculate the load by EWMA value, and return the node with low load for gRPC

- With multiple service nodes, two nodes are selected by the p2c algorithm, the load is compared, and the node with the lower load is returned for gRPC

#### `load` calculates the load of the node

The `choose` method above will call the `load` method to calculate the node load.

The formula for calculating the load is: `load = ewma * inflight`

Here is a brief explanation: `ewma` is the average request time, `inflight` is the number of requests being processed by the current node, and multiplying them together roughly calculates the network load of the current node.

```go

func (c *subConn) load() int64 {
  // Calculate the load of the node by EWMA; add 1 to avoid the case of 0
  lag := int64(math.Sqrt(float64(atomic.LoadUint64(&c.lag) + 1)))
  load := lag * (atomic.LoadInt64(&c.inflight) + 1)
  if load == 0 {
    return penalty
  }
  return load
}

```

#### End of request, update information such as `EWMA` of the node

```go

func (p *p2cPicker) buildDoneFunc(c *subConn) func(info balancer.DoneInfo) {
  start := int64(timex.Now())
  return func(info balancer.DoneInfo) {
    // Number of requests being processed minus 1
    atomic.AddInt64(&c.inflight, -1)
    now := timex.Now()
    // Save the time point at the end of this request and retrieve the time point at the last request
    last := atomic.SwapInt64(&c.last, int64(now))
    td := int64(now) - last
    if td < 0 {
      td = 0
    }
    // Calculation of β in EWMA algorithm using the decay function model in Newton's cooling law
    w := math.Exp(float64(-td) / float64(decayTime))
    // Save the elapsed time of this request
    lag := int64(now) - start
    if lag < 0 {
      lag = 0
    }
    olag := atomic.LoadUint64(&c.lag)
    if olag == 0 {
      w = 0
    }
    // Calculating EWMA values
    atomic.StoreUint64(&c.lag, uint64(float64(olag)*w+float64(lag)*(1-w)))
    success := initSuccess
    if info.Err != nil && !codes.Acceptable(info.Err) {
      success = 0
    }
    osucc := atomic.LoadUint64(&c.success)
    atomic.StoreUint64(&c.success, uint64(float64(osucc)*w+float64(success)*(1-w)))

    stamp := p.stamp.Load()
    if now-stamp >= logInterval {
      if p.stamp.CompareAndSwap(stamp, now) {
        p.logStats()
      }
    }
  }
}

```

- Subtract 1 from the total number of requests being processed by the node
- Save the time point at which the processing of the request ended, which is used to calculate the difference between the last request processed by the node and to calculate the β value in the EWMA
- calculate the time taken for this request and calculate the EWMA value and save it to the lag attribute of the node
- Calculates the health status of the node and stores it in the success attribute of the node

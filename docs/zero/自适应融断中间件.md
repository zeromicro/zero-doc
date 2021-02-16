# 自适应熔断中间件 

该中间件，go-zero内建，不需要使用者手动配置。当请求失败比率达到一定阈值之后，熔断器开启，并休眠一段时间（由配置决定），这段休眠期过后，熔断器将处于半开状态，在此状态下将试探性的放过一部分流量，如果这部分流量调用成功后，再次将熔断器关闭，否则熔断器继续保持开启并进入下一轮休眠周期。




	这篇文章，了解下 Google SRE 中的过载保护（弹性熔断）的处理机制   [Handling Overload](https://landing.google.com/sre/sre-book/chapters/handling-overload/#eq2101)


	go-zreo 为了防止小流量熔断，对该公式做了一定的修改 
![image.png](https://cdn.nlark.com/yuque/0/2020/png/112627/1603417468020-1cfe4a08-461a-462a-9bee-2576ec4955b6.png#align=left&display=inline&height=51&margin=%5Bobject%20Object%5D&name=image.png&originHeight=51&originWidth=691&size=8718&status=done&style=none&width=691)

| **params** | **参数说明** |
| --- | --- |
| requests | 总请求数量 |
| accepts | 正常请求数量 |
| K | 倍值 (Google SRE 推荐值为 2) |
| protection | 保护值（防止小流量熔断 推荐值为5） |



可以通过修改 K 的值来修改熔断发生的激进程度，降低 K 的值会使得自适应熔断算法更加激进，增加 K 的值则自适应熔断算法变得不再那么激进


```go
func (b *googleBreaker) accept() error {
	accepts, total := b.history()
	weightedAccepts := b.k * float64(accepts)
  
	dropRatio := math.Max(0, (float64(total-protection)-weightedAccepts)/float64(total+1))
    // 当max<=0的时候，会将熔断关闭，并且正常接受请求返回结果
	if dropRatio <= 0 {
		if atomic.LoadInt32(&b.state) == StateOpen {
			atomic.CompareAndSwapInt32(&b.state, StateOpen, StateClosed)
		}
		return nil
	}

 	// 当max > 0 时，会开启熔断，并有几率正常请求，max值越高，正常请求的概率越低。
	if atomic.LoadInt32(&b.state) == StateClosed {
		atomic.CompareAndSwapInt32(&b.state, StateClosed, StateOpen)
	}
	if b.proba.TrueOnProba(dropRatio) {
		return ErrServiceUnavailable
	}

	return nil
}

// 取0-1之间的随机数，传入的浮点数越大，返回true的概率越大
func (p *Proba) TrueOnProba(proba float64) (truth bool) {
	p.lock.Lock()
	truth = p.r.Float64() < proba 
	p.lock.Unlock()
	return
}
```


<Vssue title="自适应熔断中间件" />

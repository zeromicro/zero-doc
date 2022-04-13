# bloom

go-zero微服务框架中提供了许多开箱即用的工具，好的工具不仅能提升服务的性能而且还能提升代码的鲁棒性避免出错，实现代码风格的统一方便他人阅读等等，本系列文章将分别介绍go-zero框架中工具的使用及其实现原理

## 布隆过滤器[bloom](https://github.com/zeromicro/go-zero/blob/master/core/bloom/bloom.go)
在做服务器开发的时候，相信大家有听过布隆过滤器，可以判断某元素在不在集合里面,因为存在一定的误判和删除复杂问题,一般的使用场景是:防止缓存击穿(防止恶意攻击)、 垃圾邮箱过滤、cache digests 、模型检测器等、判断是否存在某行数据,用以减少对磁盘访问，提高服务的访问性能。     go-zero 提供的简单的缓存封装 bloom.bloom，简单使用方式如下

```go
// 初始化 redisBitSet
store := redis.New("redis 地址", func(r *redis.Redis) {
		r.Type = redis.NodeType
	})
// 声明一个bitSet, key="test_key"名且bits是1024位
bitSet := newRedisBitSet(store, "test_key", 1024)
// 判断第0位bit存不存在
isSetBefore, err := bitSet.check([]uint{0})

// 对第512位设置为1
err = bitSet.set([]uint{512})
// 3600秒后过期 
err = bitSet.expire(3600)

// 删除该bitSet
err = bitSet.del()
```


bloom 简单介绍了最基本的redis bitset 的使用。下面是真正的bloom实现。
对元素hash 定位

```go
// 对元素进行hash 14次(const maps=14),每次都在元素后追加byte(0-13),然后进行hash.
// 将locations[0-13] 进行取模,最终返回locations.
func (f *BloomFilter) getLocations(data []byte) []uint {
	locations := make([]uint, maps)
	for i := uint(0); i < maps; i++ {
		hashValue := hash.Hash(append(data, byte(i)))
		locations[i] = uint(hashValue % uint64(f.bits))
	}

	return locations
}
```


向bloom里面add 元素
```go
// 我们可以发现 add方法使用了getLocations和bitSet的set方法。
// 我们将元素进行hash成长度14的uint切片,然后进行set操作存到redis的bitSet里面。
func (f *BloomFilter) Add(data []byte) error {
	locations := f.getLocations(data)
	err := f.bitSet.set(locations)
	if err != nil {
		return err
	}
	return nil
}
```


检查bloom里面是否有某元素
```go
// 我们可以发现 Exists方法使用了getLocations和bitSet的check方法
// 我们将元素进行hash成长度14的uint切片,然后进行bitSet的check验证,存在返回true,不存在或者check失败返回false
func (f *BloomFilter) Exists(data []byte) (bool, error) {
	locations := f.getLocations(data)
	isSet, err := f.bitSet.check(locations)
	if err != nil {
		return false, err
	}
	if !isSet {
		return false, nil
	}

	return true, nil
}
```

本节主要介绍了go-zero框架中的 core.bloom 工具，在实际的项目中非常实用。用好工具对于提升服务性能和开发效率都有很大的帮助，希望本篇文章能给大家带来一些收获。

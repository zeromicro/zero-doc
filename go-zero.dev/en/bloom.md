# bloom

> [!TIP]
> This document is machine-translated by Google. If you find grammatical and semantic errors, and the document description is not clear, please [PR](doc-contibute.md)

The go-zero microservice framework provides many out-of-the-box tools. 
Good tools can not only improve the performance of the service, 
but also improve the robustness of the code to avoid errors, 
and realize the uniformity of the code style for others to read, etc. 
A series of articles will respectively introduce the use of tools in the go-zero framework and their implementation principles.

## Bloom filter [bloom](https://github.com/tal-tech/go-zero/blob/master/core/bloom/bloom.go)
When doing server development, I believe you have heard of Bloom filters, 
you can judge whether a certain element is in the collection, 
because there are certain misjudgments and delete complex problems, 
the general usage scenario is: to prevent cache breakdown (to prevent malicious Attacks), 
spam filtering, cache digests, model detectors, etc., 
to determine whether there is a row of data to reduce disk access and improve service access performance. 
The simple cache package bloom.bloom provided by go-zero, the simple way to use it is as follows.

```go
// Initialize redisBitSet
store := redis.NewRedis("redis 地址", redis.NodeType)
// Declare a bitSet, key="test_key" name and bits are 1024 bits
bitSet := newRedisBitSet(store, "test_key", 1024)
// Determine whether the 0th bit exists
isSetBefore, err := bitSet.check([]uint{0})

// Set the 512th bit to 1
err = bitSet.set([]uint{512})
// Expires in 3600 seconds 
err = bitSet.expire(3600)

// Delete the bitSet
err = bitSet.del()
```


Bloom briefly introduced the use of the most basic redis bitset. The following is the real bloom implementation.

Position the element hash

```go
// The element is hashed 14 times (const maps=14), and byte (0-13) is appended to the element each time, and then the hash is performed.
// Take the modulo of locations[0-13], and finally return to locations.
func (f *BloomFilter) getLocations(data []byte) []uint {
	locations := make([]uint, maps)
	for i := uint(0); i < maps; i++ {
		hashValue := hash.Hash(append(data, byte(i)))
		locations[i] = uint(hashValue % uint64(f.bits))
	}

	return locations
}
```


Add elements to bloom
```go
// We can find that the add method uses the set methods of getLocations and bitSet.
// We hash the elements into uint slices of length 14, and then perform the set operation and store them in the bitSet of redis.
func (f *BloomFilter) Add(data []byte) error {
	locations := f.getLocations(data)
	err := f.bitSet.set(locations)
	if err != nil {
		return err
	}
	return nil
}
```


Check if there is an element in bloom
```go
// We can find that the Exists method uses the check method of getLocations and bitSet
// We hash the elements into uint slices of length 14, and then perform bitSet check verification, return true if it exists, false if it does not exist or if the check fails
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

This section mainly introduces the `core.bloom` tool in the go-zero framework, which is very practical in actual projects. Good use of tools is very helpful to improve service performance and development efficiency. I hope this article can bring you some gains.
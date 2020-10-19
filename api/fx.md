## Functions

### type Stream

```go
Stream struct {
	source <-chan interface{}
}
```

`Stream` Returns a readable stream that can be read in and processed, then flowing to the next stream.

### func From

```go
type GenerateFunc func(source chan<- interface{})

func From(generate GenerateFunc) Stream
```

Create a stream that the following functions can read in. As the beginning of the flow.

### func Just

```go
func Just(items ...interface{}) Stream
```

Converts the given arbitrary items to a Stream.

### func Range

```go
func Range(source <-chan interface{}) Stream
```

Converts the given channel to a Stream.

### type Option

```go
rxOptions struct {
  // whether to limit the parallel number 
  // [true: defaultWorkers(16); false: option.workers]
  unlimitedWorkers bool
  // count of parallel workers
  workers          int
}

type Option func(opts *rxOptions)
```

### func WithWorkers

```go
func WithWorkers(workers int) Option
```

Lets the caller to customize the concurrent workers. Will sets the minimum number of parallelism: `minWorkers(1)`

### func (Stream) Buffer

```go
func (p Stream) Buffer(n int) Stream
```

Buffers the items into a queue with size n.It can balance the producer and the consumer if their processing throughput don't match.

### func (Stream) Count

```go
func (p Stream) Count() (int)
```

Counts the number of elements in the result.

### func (Stream) Distinct

```go
type KeyFunc    func(item interface{}) interface{}

func (p Stream) Distinct(fn KeyFunc) Stream
```

Removes the duplicated items base on the given `KeyFunc`.

### func (Stream) Done

```go
func (p Stream) Done()
```

Waits all upstreaming operations to be done.

### func (Stream) Filter

```go
type FilterFunc func(item interface{}) bool

func (p Stream) Filter(fn FilterFunc, opts ...Option) Stream
```

Filters the items by the given `FilterFunc`.

### func (Stream) ForAll

```go
type ForAllFunc func(pipe <-chan interface{})

func (Stream) ForAll(fn ForAllFunc)
```

Handles the streaming elements from the source and no later streams.

### func (Stream) ForEach

```go
type ForEachFunc  func(item interface{})

func (p Stream) ForEach(fn ForEachFunc)
```

Seals the Stream with the ForEachFunc on each item, no successive operations.

### func (Stream) Group

```go
type KeyFunc  func(item interface{}) interface{}

func (p Stream) Group(fn KeyFunc) Stream
```

Groups the elements into different groups based on their keys.

### func (Stream) Head

```go
func (p Stream) Head(int64) Stream
```

The first few elements in the stream are taken out in order, and return a new `Stream`.

### func (Stream) Map

```go
type MapFunc func(item interface{}) interface{}

func (p Stream) Map(fn MapFunc, opts ...Option) Stream
```

Converts each item to another corresponding item, which means it's a 1:1 model.

### func (Stream) Merge

```go
func (p Stream) Merge() Stream
```

Merges all the items into a slice and generates a new stream.

### func (Stream) Parallel

```go
type ParallelFunc func(item interface{})

func (p Stream) Parallel(fn ParallelFunc, opts ...Option)
```

Applies the given `ParallelFunc` to each item concurrently with given number of workers.Finally, execute `Done()`

### func (Stream) Reduce

```go
type ReduceFunc func(pipe <-chan interface{}) (interface{}, error)

func (p Stream) Reduce(fn ReduceFunc) (interface{}, error)
```

`Reduce` is a utility method to let the caller deal with the underlying channel.

### func (Stream) Reduce

```go
func (p Stream) Reverse() Stream
```

Reverse reverses the elements in the stream.

### func (Stream) Reverse

```go
func (p Stream) Reverse() Stream
```

Reverses the elements in the stream.

### func (Stream) Sort

```go
type 	LessFunc func(a, b interface{}) bool

func (p Stream) Sort(less LessFunc) Stream
```

Sorts the items from the underlying source.

### func (Stream) Split

```go
func (p Stream) Split(int) Stream
```

Split splits the elements into chunk with size up to n, might be less than n on tailing elements.

### func (Stream) Split

```go
func (p Stream) Tail(n int64) Stream
```

Outputs the last N elements of the stream in reverse order to the next stream

### func (Stream) Walk

```go
type WalkFunc  func(item interface{}, pipe chan<- interface{})

func (p Stream) Walk(fn WalkFunc, opts ...Option) Stream
```

Lets the callers handle each item, the caller may write zero, one or more items base on the given item.
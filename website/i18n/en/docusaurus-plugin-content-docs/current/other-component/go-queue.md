---
sidebar_position: 1
---

# Go Queue

Delayed queue: a message queue with a delay function

- deferred → an indefinite time in the future
- mq → consumption behavior is sequential

With this explanation, the whole design is clear. Your purpose is delay, and the bearer container is mq.

### Background

To list scenarios that may exist in my daily business.

- Creating a delayed schedule and needing to remind the teacher of class
- Delayed push → pushing the teacher needs announcements and assignments

To solve the above problem, the easiest and most direct way is to go to the schedule sweeper regularly.

:::info
When the service starts, open an asynchronous concurrent process → scan the msg table at regular intervals, trigger an event when it arrives, and call the corresponding handler
:::

Several disadvantages.

- Every service that needs a timed/delayed task needs a msg table for additional storage → storage is coupled with the business
- Timed scanning → bad timing control, may miss trigger time
- It is a burden on the msg table instance. Repeatedly, one service keeps putting constant pressure on the database

What is the biggest problem?

Scheduling model is basically unified, don't do duplicate business logic

We can consider taking the logic out of the specific business logic and turning it into a common part.

And this scheduling model, is the delay queue .

In fact, to put it plainly.

The delayed queue model is to store future execution events in advance, and then continuously scan this store to execute the corresponding task logic if the execution time is triggered.

So is there a ready-made solution in the open source world? The answer is yes. Beanstalk (https://github.com/beanstalkd/beanstalkd) basically meets these requirements

### Design purpose

- Consumer behavior at least
- High availability
- Real-time
- Support for message deletion

The design directions for these purposes are stated one at a time.

#### consumption behavior

This concept is taken from mq. mq provides several directions for consuming casts.

- at most once → at most once, messages may be lost, but not repeated
- at least once → at least once, the message is definitely not lost, but may be repeated
- exactly once → once and only once, messages are not lost and not repeated, and are consumed only once.

exactly once is guaranteed on both the producer + consumer side if possible. When the producer has no way to guarantee this, the consumer needs to do a de-duplication before consumption, so that the message is consumed once and not repeatedly, which is guaranteed directly inside the delay queue.

The simplest: use redis setNX to achieve unique consumption of job ids

#### High Availability

Multi-instance deployment is supported. When one instance goes down, there is a backup instance that continues to provide services.

This externally available API uses a cluster model, where multiple nodes are encapsulated internally and redundant storage is available across multiple nodes.

#### Why not use Kafka?

After considering similar solutions based on message queues such as kafka/rocketmq as storage, the storage design model abandoned this option.

For example, suppose we use a message queue storage like Kafka to implement the delay function, each queue time needs to create a separate topic (e.g. Q1-1s, Q1-2s...) . This design is not a big problem in scenarios where the delay time is fixed, but if the delay time varies greatly, the number of topics will be too many, which will turn the disk from sequential reads and writes into random reads and writes, leading to performance degradation and other problems like restart or long recovery time.

- Too many topics → storage pressure
- The topic stores the real time, and the reads at different times (topic) are sequential reads → random reads when scheduling.
- Similarly, when writing, sequential write → random write

### Architecture Design

![dq](/img/dq.png)

### API Design

producer

- producer.At(msg []byte, at time.Time)
- producer.Delay(body []byte, delay time.Duration)
- producer.Revoke(ids string)

consumer

- consumer.Consume(consume handler)

After using the delayed queue, the overall structure of the service is as follows, as well as the state changes of the jobs in the queue.

![delay queue](/img/delay-queue.png)

- service → producer.At(msg []byte, at time.Time) → insert delayed job into the tube
- Timed trigger → job state is updated to ready
- consumer gets ready job → fetches job and starts consuming; and changes state to reserved
- Execute the handler logic function passed into the consumer

### Production Practice

It mainly describes what specific features we use for delayed queues in our daily development.

#### Production side

- To produce a delayed task in development, just determine the task execution time
    - Pass in At() producer.At(msg []byte, at time.Time)
    - The time difference is calculated internally by itself and inserted into tube
- If there are changes to the task time, and changes to the task content
    - In production time, it may be necessary to create an additional relationship table of logic_id → job_id
    - Query to job_id → producer.Revoke(ids string), delete it, and reinsert it
    
#### consumer side

First, the framework level to ensure that the consumption behavior of exactly once, but the upper business logic consumption failure or network problems, or a variety of problems, resulting in consumption failure, the bottom to the business development to do. Reasons for doing so.

- framework and the underlying components only to ensure the correctness of the flow of job state
- Framework consumer side only to ensure the uniformity of consumption behavior
- delayed tasks in different business behavior is not uniform
    - Emphasis on the mandatory nature of the task, the consumption of failure requires continuous retry until the task success
    - Emphasis on the punctuality of the task, then consumption failure, business-insensitive, can choose to discard
    
Here is a description of how the consumer side of the framework to ensure the uniformity of consumption behavior.

There are cluster and node. cluster.

`https://github.com/tal-tech/go-queue/blob/master/dq/consumer.go#L45`

- The cluster internally repackages the consume handler with a layer
- hash the consume body and use this hash as the key for redis de-duplication
- If it exists, it is not processed and is discarded

#### node

`https://github.com/tal-tech/go-queue/blob/master/dq/consumernode.go#L36`

- consume node to get ready job; first execute Reserve(TTR), book this job, will execute this job for logical processing
- delete(job) in the node; then consume
    - If it fails, it will be thrown up to the business layer to do the corresponding under the hood retry
    
So for the consumption side, developers need to implement the idempotency of consumption themselves.

![idempotent](/img/idempotent.png)

### Usage examples

[usage example](https://github.com/zeromicro/go-queue/tree/master/example)




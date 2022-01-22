---
sidebar_position: 7
---

# Log collection
To ensure stable business operation and predict the risk of unhealthy services, log collection can help us to have a good observation of the current service health.
In traditional business development, when there are not many machines deployed yet, we usually log into the server directly to view and debug the logs, but as the business grows and the services are continuously split, the
The maintenance cost of the service will also become more and more complicated. In a distributed system, the number of server machines increases and the service is distributed on different servers, when problems are encountered
We can't use the traditional practice of logging in to the server for logging and debugging, which is a complexity that can be imagined.
![log-flow](/img/log-flow.png)

:::tip
It is not recommended to use it directly if it is a simple monolithic service system or if the service is too small, otherwise it will be counterproductive.
:::

## Preparation
* kafka
* elasticsearch
* kibana
* filebeat, Log-Pilot (k8s)
* go-stash

## filebeat configuration
```shell
$ vim xx/filebeat.yaml
```

```yaml
filebeat.inputs:
- type: log
  enabled: true
  # enable json parsing
  json.keys_under_root: true
  json.add_error_key: true
  # Log file paths
  paths:
    - /var/log/order/*.log

setup.template.settings:
  index.number_of_shards: 1

# Define kafka topic field
fields:
  log_topic: log-collection

# Output to kafka
output.kafka:
  hosts: ["127.0.0.1:9092"]
  topic: '%{[fields.log_topic]}'
  partition.round_robin:
    reachable_only: false
  required_acks: 1
  keep_alive: 10s

# ================================= Processors =================================
processors:
  - decode_json_fields:
      fields: ['@timestamp','level','content','trace','span','duration']
      target: ""
```

:::tip
xx is the path where filebeat.yaml is located
:::

## go-stash configuration
* Create a new `config.yaml` file
* Add configuration content

```shell
$ vim config.yaml
```

```yaml
Clusters:
- Input:
    Kafka:
      Name: go-stash
      Log:
        Mode: file
      Brokers:
      - "127.0.0.1:9092"
      Topics: 
      - log-collection
      Group: stash
      Conns: 3
      Consumers: 10
      Processors: 60
      MinBytes: 1048576
      MaxBytes: 10485760
      Offset: first
  Filters:
  - Action: drop
    Conditions:
      - Key: status
        Value: "503"
        Type: contains
      - Key: type
        Value: "app"
        Type: match
        Op: and
  - Action: remove_field
    Fields:
    - source
    - _score
    - "@metadata"
    - agent
    - ecs
    - input
    - log
    - fields
  Output:
    ElasticSearch:
      Hosts:
      - "http://127.0.0.1:9200"
      Index: "go-stash-{{yyyy.MM.dd}}"
      MaxChunkBytes: 5242880
      GracePeriod: 10s
      Compress: false
      TimeZone: UTC
```

## Start services (in order)
* Start kafka
* Start elasticsearch
* Start kibana
* start go-stash
* start filebeat
* Start order-api service and its dependencies (order-api service in the go-zero-demo project)

## Access kibana
Go to 127.0.0.1:5601
![log](/img/log.png)

:::tip
Here is a demonstration of collecting logs generated via logx in the service only, same for log collection in nginx.
:::

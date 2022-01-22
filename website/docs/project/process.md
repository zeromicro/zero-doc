---
sidebar_position: 2
---

# 开发流程

这里的开发流程和我们实际业务开发流程不是一个概念，这里的定义局限于go-zero的使用，即代码层面的开发细节。

## 开发流程
* goctl环境准备[1]
* 数据库设计
* 业务开发
* 新建工程
* 创建服务目录
* 创建服务类型（api/rpc/rmq/job/script）
* 编写api、proto文件
* 代码生成
* 生成数据库访问层代码model
* 配置config，yaml变更
* 资源依赖填充（ServiceContext）
* 添加中间件
* 业务代码填充
* 错误处理

## 开发工具
* Visual Studio Code
* Goland(推荐)
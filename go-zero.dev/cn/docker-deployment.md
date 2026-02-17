# docker-deployment

## 如何使用docker部署项目？

### docker部署项目的好处

1. 一致性：Docker 容器可以在不同环境中以相同的方式运行，无论是开发、测试、预生产还是生产环境。这确保了项目在不同阶段的一致性，避免了“在我这里能工作”的问题。
2.  可移植性：容器可以在不同的云平台、操作系统和基础设施上运行，从而实现了项目的高度可移植性。这意味着你可以轻松地将应用程序从一个环境迁移到另一个环境，而不需要修改代码。 
3.  环境隔离：Docker 容器提供了隔离的运行环境，可以将应用程序及其依赖项隔离开来。这有助于避免依赖冲突和应用程序之间的干扰。
4. 持续集成/持续交付（CI/CD）：Docker 可以与 CI/CD 工具集成，帮助自动化构建、测试和部署过程。这样可以加速软件交付流程，提高生产力。 
5. 扩展性：Docker 容器可以根据需要动态扩展，以满足流量波动或负载增加的要求。这使得应用程序更容易实现水平扩展。

### 使用goctl构建dockerfile

当我们完成一个服务的api/rpc开发的时候，我们可以使用go-zero自带的goctl工具生成相应的dockerfile文件

1. cd到服务的api/rpc/mq下面
2. 终端输入 

```
goctl docker -go xxx.go
```

这里的xx是你服务的main.go文件

![image-20230911203441449](https://raw.githubusercontent.com/liuxianloveqiqi/Xian-imagehost/main/image/202309112034503.png)

比如我这里就应该输入

```
goctl docker -go video.go
```

之后就会看见下面会生成dockerfile文件，这个dockerfile文件就可以用来构建docker image

```dockerfile
FROM golang:alpine AS builder


LABEL stage=gobuilder

ENV CGO_ENABLED 0
ENV GOPROXY https://goproxy.cn,direct
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

RUN apk update --no-cache && apk add --no-cache tzdata

WORKDIR /build

ADD go.mod .
ADD go.sum .
RUN go mod download
COPY . .
COPY server/video/rpc/etc /app/etc
RUN go build -ldflags="-s -w" -o /app/video server/video/rpc/video.go


FROM scratch

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=builder /usr/share/zoneinfo/Asia/Shanghai /usr/share/zoneinfo/Asia/Shanghai
ENV TZ Asia/Shanghai

WORKDIR /app
COPY --from=builder /app/video /app/video
COPY --from=builder /app/etc /app/etc

CMD ["./video", "-f", "etc/video.yaml"]

```

下面来解读一下这个文件

1. **第一阶段 - 构建应用程序**:

   ```
   FROM golang:alpine AS builder
   LABEL stage=gobuilder
   ENV CGO_ENABLED 0
   ENV GOPROXY https://goproxy.cn,direct
   RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
   ```

   - 使用 `golang:alpine` 作为基础镜像，这是一个轻量级的Alpine Linux基础镜像，并具有Golang编译器。
   - 设置了一些环境变量，包括禁用CGO（C语言绑定）以静态编译Go二进制文件，以及配置了GOPROXY以加速Go模块的下载。
   - 使用 `sed` 命令将Alpine Linux软件包的镜像源更改为阿里云镜像，以提高下载速度。

2. **安装基础依赖**:

   ```dockerfile
   DockerfileCopy code
   RUN apk update --no-cache && apk add --no-cache tzdata
   ```

   - 使用Alpine的包管理器 `apk` 来更新包索引并安装 `tzdata` 包，用于时区数据。

3. **设置工作目录**:

   ```dockerfile
   DockerfileCopy code
   WORKDIR /build
   ```

   - 设置工作目录为 `/build`，后续的命令将在这个目录中执行。

4. **复制项目文件**:

   ```dockerfile
   ADD go.mod .
   ADD go.sum .
   COPY . .
   COPY server/video/rpc/etc /app/etc
   ```

   - 复制项目的 `go.mod` 和 `go.sum` 文件到容器中。
   - 复制整个项目目录到容器中。
   - 复制 `server/video/rpc/etc` 目录到 `/app/etc`，该目录包含应用程序的配置文件。

5. **下载Go模块依赖**:

   ```dockerfile
   RUN go mod download
   ```

   - 使用 `go mod download` 命令下载Go模块的依赖项。

6. **构建应用程序**:

   ```dockerfile
   RUN go build -ldflags="-s -w" -o /app/video server/video/rpc/video.go
   ```

   - 使用 `go build` 命令构建Go应用程序，输出二进制文件到 `/app/video`。
   - `-ldflags="-s -w"` 用于在构建时去除调试信息以减小二进制文件大小。

7. **第二阶段 - 最终镜像**:

   ```dockerfile
   FROM scratch
   ```

   - 使用空白的基础镜像 `scratch`，这是一个最小的基础镜像，适用于静态二进制文件。

8. **复制必要文件和时区信息**:

   ```dockerfile
   COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
   COPY --from=builder /usr/share/zoneinfo/Asia/Shanghai /usr/share/zoneinfo/Asia/Shanghai
   ENV TZ Asia/Shanghai
   ```

   - 从前一阶段的构建器容器中复制证书文件和时区信息到最终镜像。
   - 设置容器的时区为亚洲/上海。

9. **设置工作目录**:

   ```dockerfile
   WORKDIR /app
   ```

   - 设置工作目录为 `/app`，后续的命令将在这个目录中执行。

10. **复制应用程序文件和配置**:

    ```dockerfile
    COPY --from=builder /app/video /app/video
    COPY --from=builder /app/etc /app/etc
    ```

    - 从前一阶段的构建器容器中复制应用程序二进制文件和配置文件到最终镜像的 `/app` 目录下。

11. **定义容器启动命令**:

    ```dockerfile
    DockerfileCopy code
    CMD ["./video", "-f", "etc/video.yaml"]
    ```

    - 定义容器启动时执行的命令，启动应用程序 `./video` 并传递 `-f etc/video.yaml` 作为参数，这指定应用程序配置文件的方式。

这个Dockerfile的主要目的是构建一个轻量级的容器，其中包含一个Golang应用程序，该应用程序使用自定义的配置文件运行。容器会使用Alpine Linux的轻量级基础镜像以及 `scratch` 基础镜像来最小化容器的大小。容器启动时会设置正确的时区信息和证书文件，以确保应用程序在容器中正常运行。

#### 注意事项！！！

* 如果你服务里面有别的配置文件，请在第一阶段和第二阶段一起拷贝进来
* 第二阶段依靠`scratch`，这是一个最小的基础镜像，就也是没有bah这样的shell，如果你需要bash，将`scratch`换成`alpine`，镜像的体积大不了几mb
* 如果你程序里面涉及到**泛型**，请使用`FROM golang:1.20.5-alpine AS builder`，这里使用==1.80以上==的版本都可以

### 如何构建docker镜像？

#### 方式1——本地终端构建

首先你要回到项目的根目录，也就是go.mod的地方，输入：

```
docker build -t your-image-name:tag -f /path/to/your/Dockerfile .
```

这里分别填写镜像名称和标签以及dockerfile的路径

#### 方式2——docker-compose构建并直接运行

```yaml
version: '3'
services:
  myapp:
    build:
      context: ./path/to/your/app
      dockerfile: Dockerfile
    image: your-image-name:tag

```

这样会构建好了直接启动

#### 使用Github Action自动构建并且推送镜像到dockerhub

简易先了解GitHub Action:https://docs.github.com/en/actions

```yaml
name: Docker Build and Push Chat
on:
  workflow_dispatch:
    inputs:
      parameter_name:
        description: 'go'
        required: true
jobs:
  # chat-rpc
  build-and-push-chat-rpc:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout the repository
        uses: actions/checkout@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v1
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v1

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v1

      - name: Create and push chat-rpc Docker image
        uses: docker/build-push-action@v2
        with:
          context: .
          file: ./server/chat/rpc/Dockerfile
          push: true
          tags: ${{ secrets.DOCKERHUB_IMAGE }}chat-rpc:latest
          platforms: linux/amd64,linux/arm64  # 构建多个架构的镜像
      - name: executing remote ssh commands using password
        uses: appleboy/ssh-action@v0.1.10
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          password: ${{ secrets.PASSWORD }}
          port: ${{ secrets.PORT }}
          script: |
            cd /home/project/gophertok
.......

```

这是一个GitHub Actions工作流程的配置文件，用于自动构建和推送Docker镜像，然后在远程服务器上部署应用程序的一部分。让我逐步解释每个部分的作用：

1. **workflow_dispatch**：

   - 定义了一个触发器，即`workflow_dispatch`，允许手动触发此工作流程。当你在GitHub仓库中手动运行工作流程时，会使用此触发器。

2. **jobs**：

   - 定义了工作流程中的任务。

3. **build-and-push-chat-rpc**：

   - 一个名为 `build-and-push-chat-rpc` 的任务，用于构建和推送 chat-rpc Docker 镜像以及部署到远程服务器。

4. **runs-on**：

   - 指定了在哪个操作系统环境中运行这个任务，这里使用的是 `ubuntu-latest`。

5. **steps**：

   - 此任务包含一系列步骤，每个步骤执行一个操作。

6. **Checkout the repository**：

   - 使用 `actions/checkout@v2` 动作来检出GitHub仓库的内容，以便后续步骤可以访问项目文件。

7. **Login to Docker Hub**：

   - 使用 `docker/login-action@v1` 动作来登录到Docker Hub，以便能够推送构建的Docker镜像。登录需要使用存储在GitHub仓库机密中的Docker用户名和token（`DOCKER_USERNAME` 和 `DOCKERHUB_TOKEN`）。
   - 注册账号后，进入https://hub.docker.com/settings/security获取token

   ![image-20230911210404217](https://raw.githubusercontent.com/liuxianloveqiqi/Xian-imagehost/main/image/202309112104401.png)

   记得把 token 复制保存下来，这个界面关闭后就再也看不到token了

   * Github Secret 会作为环境变量在Github Action运行中使用，不会暴露在日志中，因此特别适合存放token或者密码。

   ![image-20230911210700370](https://raw.githubusercontent.com/liuxianloveqiqi/Xian-imagehost/main/image/202309112107429.png)

8. **Set up QEMU** 和 **Set up Docker Buildx**：

   - 这两个步骤用于设置Docker Buildx，它是用于构建多个架构的Docker镜像的工具。QEMU是一个用于跨架构构建的工具，这些步骤准备了构建环境。

9. **Create and push chat-rpc Docker image**：

   - 使用 `docker/build-push-action@v2` 动作来构建 chat-rpc Docker 镜像，并将其推送到Docker Hub。配置中包括构建上下文、Dockerfile路径、推送标签等信息。还配置了要构建的多个架构，包括 `linux/amd64` 和 `linux/arm64`。

   

10. **executing remote ssh commands using password**：（补充ssh登录远程服务器）

    - 使用 `appleboy/ssh-action@v0.1.10` 动作来执行远程SSH命令。这个步骤连接到远程服务器，执行一系列命令来停止、删除旧的 chat-rpc 容器、删除旧的 Docker 镜像，然后使用新构建的 Docker 镜像启动 chat-rpc 容器。远程连接信息和命令都使用 GitHub 仓库的机密（`secrets`）中存储的值进行配置。

```
          script: |
            cd /home/project/gophertok
```

这之后你可以加其他的命令，比如执行一些脚本什么的，或者执行docker-compose部署容器

### 参考

https://zhuanlan.zhihu.com/p/427298660

https://go-zero.dev/docs/tutorials/cli/docker?_highlight=docker


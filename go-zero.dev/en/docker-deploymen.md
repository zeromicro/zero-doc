# docker-deployment

## How to deploy a project with docker?

### Benefits of docker deployment projects

1. Consistency: Docker containers can run the same way in different environments, be it development, test, pre-production, or production. This ensures consistency across the different phases of the project and avoids the "it works for me" problem.
Portability: Containers can run on different cloud platforms, operating systems, and infrastructures, enabling a high degree of portability of the project. This means that you can easily migrate your application from one environment to another without having to modify your code.
3. Environment Isolation: Docker containers provide an isolated runtime environment that can isolate the application and its dependencies. This helps avoid dependency conflicts and interference between applications.
Continuous Integration/Continuous Delivery (CI/CD) : Docker can integrate with CI/CD tools to help automate the build, test, and deployment processes. This speeds up the software delivery process and increases productivity.
5. Scalability: Docker containers can dynamically scale as needed to meet fluctuations in traffic or increased load. This makes it easier for applications to scale horizontally.

### Building a dockerfile with goctl

When we are done with the api/rpc development of a service, we can generate the dockerfile using goctl tool that comes with go-zero

1. cd to the service under api/rpc/mq
Terminal input

```
goctl docker -go xxx.go
```

Here xx is the main.go file for your service

![image-20230911203441449](https://raw.githubusercontent.com/liuxianloveqiqi/Xian-imagehost/main/image/202309112034503.png)

For example, I should type in here

```
goctl docker -go video.go
```

You will see a dockerfile generated below. This dockerfile will be used to build docker image

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

Let's unpack this file

1. **Phase 1 - Building the application**:

   ```
   FROM golang:alpine AS builder
   LABEL stage=gobuilder
   ENV CGO_ENABLED 0
   ENV GOPROXY https://goproxy.cn,direct
   RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
   ```

   - Use 'golang:alpine' as the base image, which is a lightweight Alpine Linux base image with a Golang compiler.
   - Some environment variables are set, including disabling CGO (C binding) to statically compile Go binaries, and configuring GOPROXY to speed up Go module downloads.
   - Use 'sed' command to change the image source of Alpine Linux package to Alibaba Cloud image to improve download speed.

2. **Install Basic Dependencies**:

   ```
   RUN apk update --no-cache && apk add --no-cache tzdata
   ```

   - Use Alpine's package manager `apk` to update the package index and install the `tzdata` package, which is used for time zone data.

3. **Set Working Directory**:

   ```
   WORKDIR /build
   ```

   - Set the working directory to `/build`, where subsequent commands will be executed.

4. **Copy Project Files**:

   ```
   ADD go.mod .
   ADD go.sum .
   COPY . .
   COPY server/video/rpc/etc /app/etc
   ```

   - Copy the project's `go.mod` and `go.sum` files into the container.
   - Copy the entire project directory into the container.
   - Copy the `server/video/rpc/etc` directory to `/app/etc`, which contains the application's configuration files.

5. **Download Go Module Dependencies**:

   ```
   RUN go mod download
   ```

   - Use the `go mod download` command to download the dependencies of the Go modules.

6. **Build the Application**:

   ```
   RUN go build -ldflags="-s -w" -o /app/video server/video/rpc/video.go
   ```

   - Use the `go build` command to build the Go application, and output the binary file to `/app/video`.
   - The `-ldflags="-s -w"` flag is used to strip debugging information during the build process, reducing the size of the binary file.

7. **Second Stage - Final Image**:

   ```
   FROM scratch
   ```

   - Use an empty base image `scratch`. This is a minimal base image suitable for static binary files.

8. **Copy Necessary Files and Timezone Information**:

   ```
   COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
   COPY --from=builder /usr/share/zoneinfo/Asia/Shanghai /usr/share/zoneinfo/Asia/Shanghai
   ENV TZ Asia/Shanghai
   ```

   - Copy the certificate file and timezone information from the builder container in the previous stage to the final image.
   - Set the container's timezone to Asia/Shanghai.

9. **Set Working Directory**:

   ```
   WORKDIR /app
   ```

   - Set the working directory to `/app`, where subsequent commands will be executed.

10. **Copy Application Files and Configuration**:

    ```
    COPY --from=builder /app/video /app/video
    COPY --from=builder /app/etc /app/etc
    ```

    - Copy the application's binary file and configuration files from the builder container in the previous stage to the `/app` directory of the final image.

11. **Define Container Startup Command**:

    ```
    CMD ["./video", "-f", "etc/video.yaml"]
    ```

    - Define the command to be executed when the container starts. It starts the `./video` application with `-f etc/video.yaml` as a parameter, specifying the application's configuration file.

Please note the following considerations:

- If your service has additional configuration files, make sure to copy them in both the first and second stages.
- The second stage relies on `scratch`, which is a minimal base image without a shell such as `bash`. If you need a shell, you can replace `scratch` with `alpine`, which adds a shell. However, this will increase the image size slightly.
- If your program involves generics, please use `FROM golang:1.20.5-alpine AS builder`. Versions above 1.80 should work fine for this purpose.

These instructions are part of a Dockerfile designed to create a lightweight container for running a Golang application with custom configurations. The Dockerfile optimizes image size and runtime efficiency for containerized applications.

### How to Build a Docker Image?

#### Method 1 - Building Locally from the Terminal

First, navigate to the root directory of your project, where the `go.mod` file is located, and run the following command:

```
docker build -t your-image-name:tag -f /path/to/your/Dockerfile .
```

Replace `your-image-name` with the desired image name, `tag` with the desired tag, and `/path/to/your/Dockerfile` with the path to your Dockerfile.

#### Method 2 - Building and Running with docker-compose

Create a `docker-compose.yml` file with the following content:

```
version: '3'
services:
  myapp:
    build:
      context: ./path/to/your/app
      dockerfile: Dockerfile
    image: your-image-name:tag
```

This will build and start the container directly.

#### Using GitHub Action to Automatically Build and Push the Image to Docker Hub

For a simple understanding of GitHub Action, refer to: [GitHub Action Documentation](https://docs.github.com/en/actions)

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

1. * This is a configuration file for a GitHub Actions workflow used to automate the build and push of a Docker image and then deploy part of the application on a remote server. Let me explain the purpose of each section step by step:

     1. **workflow_dispatch**:

        - Defines a trigger, namely `workflow_dispatch`, allowing manual triggering of this workflow. When you manually run a workflow in your GitHub repository, this trigger is used.

     2. **jobs**:

        - Defines the tasks within the workflow.

     3. **build-and-push-chat-rpc**:

        - A task named `build-and-push-chat-rpc` responsible for building and pushing the chat-rpc Docker image and deploying it to a remote server.

     4. **runs-on**:

        - Specifies the operating system environment in which this task will run; in this case, it's `ubuntu-latest`.

     5. **steps**:

        - This task comprises a series of steps, with each step performing an action.

     6. **Checkout the repository**:

        - Uses the `actions/checkout@v2` action to fetch the contents of the GitHub repository, allowing subsequent steps to access project files.

     7. **Login to Docker Hub**:

        - Uses the `docker/login-action@v1` action to log in to Docker Hub, enabling the pushing of the built Docker image. Logging in requires the use of the Docker username and token stored in GitHub repository secrets (`DOCKER_USERNAME` and `DOCKERHUB_TOKEN`).
        - After registering an account, you can obtain the token by going to https://hub.docker.com/settings/security.

        ![image-20230911210404217](https://raw.githubusercontent.com/liuxianloveqiqi/Xian-imagehost/main/image/202309112351286.png)

        Remember to copy and save the token because once you close this page, you won't be able to see it again.

        - GitHub Secrets are used as environment variables during GitHub Action runs and are not exposed in the logs, making them a secure way to store tokens or passwords.

   ![image-20230911210700370](https://raw.githubusercontent.com/liuxianloveqiqi/Xian-imagehost/main/image/202309112107429.png)

2. **Set up QEMU** and **Set up Docker Buildx**:

   - These two steps are used to set up Docker Buildx, a tool for building Docker images for multiple architectures. QEMU is a tool used for cross-architecture builds, and these steps prepare the build environment.

3. **Create and push chat-rpc Docker image**:

   - The `docker/build-push-action@v2` action is used to build the chat-rpc Docker image and push it to Docker Hub. The configuration includes build context, Dockerfile path, push tags, and more. It also configures multiple architectures to build, including `linux/amd64` and `linux/arm64`.

4. **Executing remote SSH commands using password** (Supplementary step for SSH login to a remote server):

   - The `appleboy/ssh-action@v0.1.10` action is used to execute remote SSH commands. This step connects to a remote server, executes a series of commands to stop and remove old chat-rpc containers, delete old Docker images, and then use the newly built Docker image to start a chat-rpc container. Remote connection information and commands are configured using values stored in GitHub repository secrets (`secrets`).

```
          script: |
            cd /home/project/gophertok
```

After that, you can add other commands, like running some scripts, or running docker-compose to deploy containers

### Reference

https://zhuanlan.zhihu.com/p/427298660

https://go-zero.dev/docs/tutorials/cli/docker?_highlight=docker


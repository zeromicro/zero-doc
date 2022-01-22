---
sidebar_position: 6
---

# Service Deployment
This section does a simple service deployment to k8s demo via jenkins.

## Preparation
* k8s cluster installation
* gitlab environment installation
* jenkins environment installation
* redis&mysql&nginx&etcd installation
* goctl installation

:::tip
goctl ensures that k8s is available on every node
 
Please google the above environment installation by yourself, no lengthy introduction here.
:::

## Service deployment
### 1. gitlab code repository related preparation

#### 1.1. Add SSH Key

Go to gitlab, click User Center, find `Settings`, find `SSH Keys` tab on the left side
! [ssh key](/img/ssh-add-key.png)

* 1. View the public key on the machine where jenkins is located

```shell
$ cat ~/.ssh/id_rsa.pub
```

* 2. If not, you need to generate it, if it exists, skip to step 3

```shell
$ ssh-keygen -t rsa -b 2048 -C "email@example.com"
```

> "email@example.com" can be replaced with your own email
>
After finishing the generation, repeat the first step

* 3. Add the public key to gitlab

#### 1.2, upload the code to the gitlab repository
Create a new project `go-zero-demo` and upload the code, no details are described here.

### 2. jenkins

#### 2.1、Add credentials

* Check the private key of the machine where jenkins is located, corresponding to the previous gitlab public key

```shell
$ cat id_rsa
```

* Go to jenkins and click `Manage Jenkins`-> `Manage Credentials` in order
  ! [credentials](/img/jenkins-credentials.png)

* Go to the `Global Credentials` page, add credentials, `Username` is an identifier, after adding the pipeline you know that this identifier is the credentials on behalf of gitlab on the line, Private Key` that is, the private key obtained above
  Private Key` is the private key obtained above! [jenkins-add-credentials](/img/jenkins-add-credentials.png)

#### 2.2. Adding global variables
Go to `Manage Jenkins`->`Configure System`, slide to the `Global Properties` entry, add information about the docker private repository, such as `docker user name`, `docker user password`, `docker private repository address` as shown here
! [docker_server](/img/docker_env.png)

:::tip
 
`docker_user` change to your docker username
 
`docker_pass` change to your docker user password
 
`docker_server` change to your docker server address
 
Here I use a private repository, if there is no cloud vendor to provide a private repository to use, you can build a private repository by yourself, here will not repeat, we google.
:::

#### 2.3. Configure git
Go to `Manage Jenkins`->`Global Tool Configureation`, find the Git entry, fill in the path of the git executable on the machine where jenkins is located, if not, you need to download the Git plugin in jenkins plugin management.
! [jenkins-git](/img/jenkins-git.png)


! [jenkins-configure](/img/jenkins-configure.png)

#### 2.4. Adding a Pipeline

> pipeline is used to build the project, pulling code from gitlab -> generating Dockerfile -> deploying to k8s are all done in this step, here is the demo environment, to ensure smooth deployment process
> To ensure a smooth deployment process, you need to install jenkins on the machine where one of the nodes in the k8s cluster is located, I installed it on the master here.

* Get the credentials id Go to the credentials page and find the credentials id with Username as `gitlab`
  ! [jenkins-credentials-id](/img/jenkins-credentials-id.png)

* Go to the jenkins home page and click `New Item` with the name `user`
  ! [jenkins-add-item](/img/jenkins-new-item.png)

* View the project git address
  ! [gitlab-git-url](/img/gitlab-git-url.png)

* Add the service type Choice Parameter, check `This project is parameterized in General
  `, click `Add Parameter` and select `Choice Parameter`, add the selected value constants (api, rpc) and the variables (type) to receive the values according to the diagram, which will be used later in the Pipeline script.
  ! [jenkins-choice-parameter](/img/jenkins-choice.png)

* Configure `user`, on the `user` configuration page, scroll down and find `Pipeline script`, fill in the script content

```text
pipeline {
  agent any
  parameters {
      gitParameter name: 'branch', 
      type: 'PT_BRANCH',
      branchFilter: 'origin/(. *)',
      defaultValue: 'master',
      selectedValue: 'DEFAULT',
      sortMode: 'ASCENDING_SMART',
      description: 'Select the branch to build'
  }

  stages {
      stage('Service information') {
          steps {
              sh 'echo branch: $branch'
              sh 'echo build service type: ${JOB_NAME}-$type'
          }
      }


      stage('check out') {
          steps {
              checkout([$class: 'GitSCM', 
              branches: [[name: '$branch']],
              doGenerateSubmoduleConfigurations: false, 
              extensions: [], 
              submoduleCfg: [],
              userRemoteConfigs: [[credentialsId: '${credentialsId}', url: '${gitUrl}']]])
          }   
      }

      stage('get_commit_id') {
          steps {
              echo 'get commit_id'
              git credentialsId: '${credentialsId}', url: '${gitUrl}'
              script {
                  env.commit_id = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
              }
          }
      }


      stage('goctl version detection') {
          steps{
              sh '/usr/local/bin/goctl -v'
          }
      }

      stage('Dockerfile Build') {
          steps{
                 sh '/usr/local/bin/goctl docker -go service/${JOB_NAME}/${type}/${JOB_NAME}.go'
                 script{
                     env.image = sh(returnStdout: true, script: 'echo ${JOB_NAME}-${type}:${commit_id}').trim()
                 }
                 sh 'echo image name: ${image}'
                 sh 'docker build -t ${image} .'
          }
      }

      stage('upload to image repository') {
          steps{
              sh '/root/dockerlogin.sh'
              sh 'docker tag ${image} ${dockerServer}/${image}'
              sh 'docker push ${dockerServer}/${image}'
          }
      }

      stage('deploy to k8s') {
          steps{
              script{
                  env.deployYaml = sh(returnStdout: true, script: 'echo ${JOB_NAME}-${type}-deploy.yaml').trim()
                  env.port=sh(returnStdout: true, script: '/root/port.sh ${JOB_NAME}-${type}').trim()
              }

              sh 'echo ${port}'

              sh 'rm -f ${deployYaml}'
              sh '/usr/local/bin/goctl kube deploy -secret dockersecret -replicas 2 -nodePort 3${port} -requestCpu 200 -requestMem 50 -limitCpu 300 -limitMem 100 -name ${JOB_NAME}-${type} -namespace hey-go-zero -image ${dockerServer}/${image} -o ${deployYaml} -port ${port}'
              sh '/usr/bin/kubectl apply -f ${deployYaml}'
          }
      }
      
      stage('Clean') {
          steps{
              sh 'docker rmi -f ${image}'
              sh 'docker rmi -f ${dockerServer}/${image}'
              cleanWs notFailBuild: true
          }
      }
  }

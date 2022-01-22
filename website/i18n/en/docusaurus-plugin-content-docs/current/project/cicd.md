---
sidebar_position: 5
---

# CI/CD
> In software engineering, CI/CD or CICD usually refers to the combined practice of continuous integration and continuous delivery or continuous deployment.
> -- cited from [Wikipedia](https://zh.wikipedia.org/wiki/CI/CD)


![cd-cd](/img/ci-cd.png)

## What can CI do?

> The goal of modern application development is to have multiple developers working on different features of the same application at the same time. However, if an organization schedules a day to merge all branches of source code together (called a "merge day"), it can end up being cumbersome, time-consuming, and manually done. This is because when one developer working independently makes a change to the application, it may conflict with changes made by other developers at the same time. The problem is exacerbated when each developer customizes their own local integrated development environment (IDE) rather than having the team agree on a cloud-based IDE.

> Continuous integration (CI) helps developers merge code changes into a shared branch or "trunk" more frequently, sometimes daily. Once changes made by developers to the application are merged, the system validates those changes by automatically building the application and running different levels of automated tests (usually unit tests and integration tests) to ensure that the changes are not breaking the application. This means that the tests cover everything from classes and functions to the different modules that make up the entire application. If automated tests find conflicts between new and existing code, CI can more easily and quickly fix these errors.

> -- Quoted from [What is CI/CD? How to Understand Continuous Integration, Continuous Delivery and Continuous Deployment"](https://www.redhat.com/zh/topics/devops/what-is-ci-cd)

Conceptually, CI/CD encompasses the deployment process, and we'll put deployment (CD) here in a separate section [Service Deployment](deploy.md).
This section is a simple CI (Run Unit Test) demo with gitlab.

## gitlab CI
Gitlab CI/CD is Gitlab's built-in software development tool that provides
* Continuous Integration (CI)
* Continuous Delivery (CD)
* Continuous Deployment (CD)

## Preparation
* gitlab installation
* git installation
* gitlab runner installation

## Turn on gitlab CI
* Uploading code
    * Create a new repository in gitlab `go-zero-demo`
    * Upload local code to the `go-zero-demo` repository
* Create a `.gitlab-ci.yaml` file in the project root directory, which will create a pipeline that will run when there are changes in the repository.
  Each phase can contain one or more jobs running in parallel.
* Add CI content (for reference only)

    ```yaml
    stages:
    - analysis
    
    analysis:
    stage: analysis
    image: golang
    script:
    - go version && go env
    - go test -short $(go list . /...) | grep -v "no test"
    ```

:::tip
The above CI is a simple demo, for detailed gitlab CI please refer to the official gitlab documentation for a richer CI integration.
:::

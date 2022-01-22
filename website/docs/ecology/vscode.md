---
sidebar_position: 1
---

# vscode插件

该插件可以安装在 1.46.0+ 版本的 Visual Studio Code 上，首先请确保你的 Visual Studio Code 版本符合要求，并已安装 goctl 命令行工具。如果尚未安装 Visual Studio Code，请安装并打开 Visual Studio Code。 导航到“扩展”窗格，搜索 goctl 并安装此扩展（发布者ID为 “xiaoxin-technology.goctl”）。

Visual Studio Code 扩展使用请参考[这里](https://code.visualstudio.com/docs/editor/extension-gallery)。

## 功能列表

已实现功能

* 语法高亮
* 跳转到定义/引用
* 代码格式化
* 代码块提示

未实现功能:

* 语法错误检查
* 跨文件代码跳转
* goctl 命令行调用

### 语法高亮

### 代码跳转

![jump](/img/jump.gif)

### 代码格式化

调用 goctl 命令行格式化工具，使用前请确认 goctl 已加入 `$PATH` 且有可执行权限

### 代码块提示

#### info 代码块

![info](/img/info.gif)

#### type 代码块

![type](/img/type.gif)

#### service 代码块

![type](/img/service.gif)

#### handler 代码块

![type](/img/handler.gif)

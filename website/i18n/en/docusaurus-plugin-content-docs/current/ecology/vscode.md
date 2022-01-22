---
sidebar_position: 1
---

# vscode plugin

This plugin can be installed on Visual Studio Code version 1.46.0+. First make sure your version of Visual Studio Code meets the requirements and that the goctl command line tool is installed. If Visual Studio Code is not yet installed, please install and open Visual Studio Code. Navigate to the Extensions pane, search for goctl and install this extension (publisher ID "xiaoxin- technology.goctl").

Please refer to [here](https://code.visualstudio.com/docs/editor/extension-gallery) for Visual Studio Code extension usage.

## Feature List

Implemented features

* Syntax highlighting
* Jump to definition/reference
* Code formatting
* Code block hinting

Unimplemented function:

* Syntax error checking
* Cross-file code jumping
* goctl command line calls

### Syntax highlighting

### Code skipping

![jump](/img/jump.gif)

### Code formatting

Call the goctl command line formatting tool, make sure goctl is added to `$PATH` and has executable permissions before using it

### Code block hints

#### info code block

![info](/img/info.gif)

#### type code block

![type](/img/type.gif)

#### service code block

![type](/img/service.gif)

#### handler block

![type](/img/handler.gif)
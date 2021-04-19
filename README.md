# npm-tree

A tool to aid in analyzing npm (or yarn) package dependencies.

## Usage

It can be used either as a command-line utility, or as a pure online solution, available at [https://npm-tree.netlify.app](http://npm-tree.netlify.app).

### Pre-requisites

Requires version of Node 12 or newer and npm 6 or newer. Tested with Node versions 12.18.0 and 14.15.5, npm versions 6.14.4 and 7.6.1

### Command line

To run it as a command-line tool you can install it globally:

```Shell
    npm install @tromgy/npm-tree -g
```

and run it in your project directory (the one that contains **package.json**):

```Shell
    npm-tree
```

or run it via **npx** (also in your project directory):

```Shell
    npx @tromgy/npm-tree
```

When you run it, it will create an HTML file containing the same dependency information as the output from **npm list**, but in a collapsible, searchable tree and display this HTML file in your default browser:

<img alt="npm-tree in a browser" src="https://user-images.githubusercontent.com/12632548/115122684-43184f00-9f87-11eb-9ec1-dfd8dd238da4.png">

This file is removed automatically once it's loaded in the browser.

If you want to keep the file and open it later, use the **--save** option:

```Shell
    npm-tree --save
```

#### A caveat for Windows systems

If you use drive mapping via the **subst** command on Windows and try to run **npm-tree** from such mapped drive, it will not be able to open your default browser unless you also add the correspoding mapping to the following registry key:

```text
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\DOS Devices]
```

### Online

To use it online, you can just drop the text file containing the output from **npm list** or **yarn list**:

<img alt="npm-tree on Netlify" src="https://user-images.githubusercontent.com/12632548/115122744-84106380-9f87-11eb-8601-43fe7ce5c2f7.png">

It will be processed right in the browser and the same searchable tree will be shown.

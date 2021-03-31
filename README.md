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

<img alt="screen-1" src="https://user-images.githubusercontent.com/12632548/113201324-5f05bc00-9237-11eb-9a6b-8b7e56fd6983.png">

This file is removed automatically once it's loaded in the browser.

### Online

To use it online, you can just drop the text file containing the output from **npm list** or **yarn list**:

<img alt="screen-2" src="https://user-images.githubusercontent.com/12632548/113152299-ff41ed80-9203-11eb-9ba5-d0e4e1964b91.png">

It will be processed right in the browser and the same searchable tree will be shown.

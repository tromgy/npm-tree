#!/usr/bin/env node

/*
  ISC License

  Copyright (c) 2021, Tromgy (tromgy@yahoo.com)

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted, provided that the above
  copyright notice and this permission notice appear in all copies.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
  WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
  MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
  ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
  WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
  ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
  OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

const cp = require('child_process');
const fs = require('fs');
const op = require('open');
const path = require('path');

const { processList } = require('./lib/gen-tree');

const saveOutput = process.argv.length > 2 && process.argv[2] === '--save';
const generateSite = process.argv.length > 2 && process.argv[2] === '--site';

const outputName = generateSite ? 'index.html' : 'npm-tree.html';
const distDest = 'dist';

/**
 * Builds the final HTML output.
 *
 * @param {string} htmlTree - npm list data as HTML tree (nested <ul> lists)
 */
function buildFromTemplate(htmlTree) {
  const mainTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'main.html'), 'utf8');

  const lines = mainTemplate.split('\n');

  const iconPath = generateSite ? '' : __dirname;

  let output = '';

  if (generateSite) {
    output += '<!--\n';
    output += mergeFromFile(path.join(__dirname, 'LICENSE'));
    output += '-->\n';
  }

  for (const line of lines) {
    const slim = line.trim().replace('#icon-path', iconPath);

    if (slim === '<!--' || slim === '-->') {
      continue;
    }

    // Files with # are always included
    if (slim[0] === '#') {
      output += mergeFromFile(path.join(__dirname, slim.slice(1)));
    } else if (slim[0] === '%') {
      if (generateSite) {
        output += mergeFromFile(path.join(__dirname, slim.slice(1)));
      }
    } else if (slim[0] === '$') {
      if (!generateSite) {
        output += htmlTree;
      }
    } else {
      output += slim;
    }

    output += '\n';
  }

  fs.writeFileSync(outputName, output);

  if (!(saveOutput || generateSite)) {
    // Open in the default browser
    op(outputName);

    // Self-destruct in 5 sec
    setTimeout(() => {
      fs.unlinkSync(outputName);
    }, 5000);
  }
}

/**
 * Returns the contents of the specified file as a string.
 * The file is expected to be text with utf-8 encoding.
 *
 * @param {string} filePath
 * @returns {string} file contents
 */
function mergeFromFile(filePath) {
  // Filter out code not applicable in the browser
  return fs.readFileSync(filePath, 'utf8').replace('module.exports = { processList };\n', '');
}

// Main
if (!generateSite) {
  cp.exec('npm list --all', (error, stdout, stderr) => {
    if (error) {
      console.log(`\n############ Warning: npm reported errors generating dependency tree ###########`);
    }

    if (stderr) {
      console.log(`\n${stderr}`);
    }

    try {
      buildFromTemplate(processList(stdout));
    } catch (err) {
      console.log(err.message);
    }
  });
} else {
  buildFromTemplate();
  if (!fs.existsSync(distDest)) {
    fs.mkdirSync(distDest);
  }

  fs.copyFileSync(outputName, path.join(distDest, outputName));
  fs.unlinkSync(outputName);
  fs.copyFileSync('npm-tree.ico', path.join(distDest, 'npm-tree.ico'));
  fs.copyFileSync('npm-tree.png', path.join(distDest, 'npm-tree.png'));
}

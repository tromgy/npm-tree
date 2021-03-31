/**
 * Generates HTML-formatted entry for the tree node
 *
 * @param {string} rawEntry - dependency as "name@version extra"
 *
 * @returns {string} the same entry formatted as HTML
 */
function formatTreeNode(rawEntry) {
  const tokens = rawEntry.split(/@| /);
  let dependency = '';
  let version = '';
  let prefix = '';
  let index = 0;
  let offset = 0;

  for (let i = 0; i < tokens.length; i++) {
    token = tokens[i];

    if (token === 'UNMET' || token === 'PEER' || token === 'DEPENDENCY') {
      prefix += token;
      prefix += ' ';
      offset++;
    }
  }

  if (prefix) {
    prefix = `<span class="unmet-dependency">${prefix}</span>`;
  }

  // Only replace @ separating version
  if (rawEntry.startsWith('@')) {
    dependency = `@${tokens[offset + 1]}`;
    version = tokens[offset + 2];
    index = offset + 3;
  } else {
    dependency = tokens[offset];
    version = tokens[offset + 1];
    index = offset + 2;
  }

  return `${prefix}<span class="dependency" onclick="select(this, event)">${dependency}</span> <span class="version">${version}</span> ${tokens
    .slice(index)
    .join(' ')}`;
}

/**
 * Converts output from 'npm list' to HTML tree
 *
 * @param {string} input - text output from npm list
 * @param {string} itemClosedSymbol - string representing the tree "bullet" for the closed state
 *
 * @returns {string} HTML representing npm dependencies as a collapsible tree
 */
function processList(input, itemClosedSymbol) {
  const lines = input.split('\n');

  // Verify input -- must end with `-- (npm < 7) or └── (npm >= 7)
  // npm list output has always 2 new lines at the end, hence offset by 3
  const lastLine = lines[lines.length - 3].trimStart();
  const validInput = lastLine.startsWith('`-') || lastLine.startsWith('└─');

  if (!validInput) {
    throw new Error('Invalid file format');
  }

  // Is it npm or yarn list?
  if (lastLine.startsWith('└─ ')) {
    step = 3; // yarn
  } else {
    step = 2; // npm
  }

  let prevEntryStartsAt = 0;
  let output = '';

  output += `<ul><li><p>${formatTreeNode(lines[0])}</p>`;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // npm prior to 7 was using +, -, and ` to build the tree connectors
    // npm 7 uses pseudo-graphic characters
    // yarn also uses pseudo-graphic characters, but differently
    let endOfTreeRegex;

    if (step === 2) {
      endOfTreeRegex = /-- |─┬ |── /; // npm
    } else {
      endOfTreeRegex = /├─ |└─ /; // yarn
    }

    const treeEndsAt = line.search(endOfTreeRegex);

    if (treeEndsAt >= 0) {
      const dependencyEntryStartsAt = treeEndsAt + 3; // 3 is the length of regex match
      const dependencyEntry = line.substring(dependencyEntryStartsAt);

      const dependency = formatTreeNode(dependencyEntry);

      let listItem = `<p>&nbsp;&nbsp;${dependency}</p>`;

      const hideLayer = treeEndsAt > 1;

      // Look ahead to see if this line should be expandable
      if (i < lines.length - 1) {
        const nextLineTreeEndsAt = lines[i + 1].search(endOfTreeRegex);

        if (nextLineTreeEndsAt > treeEndsAt) {
          listItem = `<p class="collapsible"><span class="bullet" onclick="toggleChildrenOf(this)">${itemClosedSymbol}</span>&nbsp;${dependency}</p>`;
        }
      }

      if (dependencyEntryStartsAt > prevEntryStartsAt) {
        output += `<ul><li class="${hideLayer ? 'hidden' : 'shown'}">${listItem}`;
      } else if (dependencyEntryStartsAt < prevEntryStartsAt) {
        output += '</li>';
        let numLevelsUp = (prevEntryStartsAt - dependencyEntryStartsAt) / step;
        while (numLevelsUp-- > 0) {
          output += '</ul></li>';
        }
        output += `<li class="${hideLayer ? 'hidden' : 'shown'}">${listItem}`;
      } else {
        output += `</li><li class="${hideLayer ? 'hidden' : 'shown'}">${listItem}`;
      }

      prevEntryStartsAt = dependencyEntryStartsAt;
    }

    output += '\n';
  }

  // Close last item
  output += '</li>';

  // Now rewind to the top
  let numLevelsUp = prevEntryStartsAt / step;
  while (numLevelsUp-- > 0) {
    output += '</ul>';
  }

  return output;
}

module.exports = { processList };

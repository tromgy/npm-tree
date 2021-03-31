const dependencies = document.getElementsByClassName('dependency');
const search = document.getElementById('search');
const wholeWordSearchButton = document.getElementById('whole-word-search');
const waitShade = document.getElementById('wait-shade');
const treeContainer = document.getElementById('tree');
const path = document.getElementById('path');
const foundDependencies = [];
let lastFoundIndex = -1;
let lastFoundDependency = null;
let lastSelectedDependency = null;
const dependencyPath = [];
let timer = null;
let wholeWordSearch = false;

/**
 * Show the element as block
 *
 * @param {Element} element - the Element to change visibility of
 */
function display(element) {
  element.classList.remove('hidden');
  element.classList.add('shown');
}

/**
 * Hide the element from view
 *
 * @param {Element} element
 */
function hide(element) {
  element.classList.remove('shown');
  element.classList.add('hidden');
}

/**
 * Toggles visibility of the tree items below the given tree node.
 *
 * @param {Element} element - the Element that was the source of the event
 */
function toggleChildrenOf(element) {
  if (element) {
    const arrow = element.innerHTML;

    if (arrow === '▶︎') {
      showChildrenOf(element.parentElement);
    } else {
      hideChildrenOf(element.parentElement);
    }
  }
}

/**
 * Hides the tree nodes below the give node.
 *
 * @param {Element} element - the Element representing the tree node to hide the children of
 */
function hideChildrenOf(element) {
  // The children are not really children
  const deps = element?.nextElementSibling?.children;

  if (deps) {
    for (let i = 0; i < deps.length; i++) {
      const dep = deps.item(i);

      hide(dep);
    }
  }

  const btn = element?.firstElementChild;

  if (btn) {
    btn.textContent = '▶︎';
  }
}

/**
 * Shows the tree nodes below the give node.
 *
 * @param {Element} element - the Element representing the tree node to show the children of
 */
function showChildrenOf(element) {
  // The children are not really children
  const deps = element?.nextElementSibling?.children;

  if (deps) {
    for (let i = 0; i < deps.length; i++) {
      const dep = deps.item(i);

      display(dep);
    }
  }

  const btn = element?.firstElementChild;

  if (btn) {
    btn.textContent = '▼';
  }
}

/**
 * Yields control to JavaScript event loop by asynchronosly resolving a promise
 *
 * @returns {Promise} - an empty promise to await for
 */
function ytel() {
  return new Promise((resolve, _) =>
    setTimeout(() => {
      resolve();
    }, 0)
  );
}

/**
 * Collapses or expands the whole tree.
 *
 * @param {boolean} collapse - flag indicating wheter to collapse or expand the tree
 */
async function collapseAll(collapse) {
  const sizeToDisplayShade = 1000;
  const collapsibles = document.getElementsByClassName('collapsible');
  const numCollapsibles = collapsibles.length;

  if (numCollapsibles > sizeToDisplayShade) {
    display(waitShade);

    // Need to yield before going into the loop to let the browser render the shade
    await ytel();
  }

  for (let i = 0; i < numCollapsibles; i++) {
    const collapsible = collapsibles[i];

    if (collapse) {
      hideChildrenOf(collapsible);
    } else {
      showChildrenOf(collapsible);
    }
  }

  if (numCollapsibles > sizeToDisplayShade) {
    hide(waitShade);
  }
}

/**
 * Toggles whole-word search mode.
 */
function toggleSearchMode() {
  wholeWordSearch = !wholeWordSearch;

  if (wholeWordSearch) {
    wholeWordSearchButton.classList.add('pressed');
  } else {
    wholeWordSearchButton.classList.remove('pressed');
  }

  findAll();
  findNext();
}

/**
 * Triggers the search on changes in the search input field.
 * It uses debouncing to run the search only after some time of user inactivity.
 */
function find() {
  // Wait for that many milliseconds after typing stops
  const inactivityIntervalBeforeSearch = 500;

  if (timer) {
    clearTimeout(timer);
    timer = null;
  }

  timer = setTimeout(() => {
    findAll();
    findNext();
  }, inactivityIntervalBeforeSearch);
}

/**
 * The actual search function.
 */
function findAll() {
  const searchStr = search.value;

  foundDependencies.length = 0;
  lastFoundIndex = -1;

  if (searchStr) {
    const searchExpr = new RegExp(searchStr);

    for (let i = 0; i < dependencies.length; i++) {
      const dependency = dependencies.item(i);

      const match = wholeWordSearch ? dependency.textContent === searchStr : dependency.textContent.match(searchExpr);

      if (match) {
        foundDependencies.push(dependency);
      }
    }
  }
}

/**
 * Moves the selection to the next found instance matching the search expression.
 */
function findNext() {
  clearFound();

  if (lastFoundIndex === foundDependencies.length - 1) {
    lastFoundIndex = -1;
  }

  lastFoundDependency = foundDependencies[++lastFoundIndex];

  highlightFound();
}

/**
 * Moves the selection to the previous found instance matching the search expression.
 */
function findPrev() {
  clearFound();

  if (lastFoundIndex === 0) {
    lastFoundIndex = foundDependencies.length;
  }

  lastFoundDependency = foundDependencies[--lastFoundIndex];

  highlightFound();
}

/**
 * Visually selects the found instance.
 */
function highlightFound() {
  if (lastFoundDependency) {
    highlightAndPathify(lastFoundDependency, true);
    lastFoundDependency.scrollIntoView({ block: 'nearest' });
  }
}

/**
 * Visually selects the given tree node, builds up the path from the root, and optionally expands the
 * tree branches leading to this node.
 *
 * @param {Element} dependency - the Element that will be visually selected
 * @param {boolean} expand - the flag specifying whether to expand the tree branch(es)
 */
function highlightAndPathify(dependency, expand) {
  dependency.classList.add('selected');

  recurseParents(dependency, expand);

  path.innerHTML = dependencyPath.join('<span class="path-separator">&nbsp;▷&nbsp;</span>');
  path.title = dependencyPath.join(' > ');
}

/**
 * Recurses the tree up to the root from the given node, building up the path, and optionally expands the
 * tree branches along the way.
 *
 * @param {Element} dependency - the Element that will be visually selected
 * @param {boolean} expand - the flag specifying whether to expand the tree branch(es)
 */
function recurseParents(dependency, expand) {
  if (dependency.tagName === 'LI') {
    // Get the actual dependency name
    dependencyPath.unshift(dependency.getElementsByClassName('dependency')[0].innerHTML);

    // Get the collapsible element (if any)
    const collapsibles = dependency.getElementsByClassName('collapsible');

    if (collapsibles && expand) {
      showChildrenOf(collapsibles[0]);
    }
  }

  const parent = dependency.parentElement;

  if (parent && parent.tagName !== 'MAIN') {
    recurseParents(parent, expand);
  }
}

/**
 * Clears all visual selection.
 */
function clearFound() {
  clearSelected(lastFoundDependency);
  clearSelected(lastSelectedDependency);
}

/**
 * Clears visual selection from the given tree node.
 *
 * @param {Element} dependency - the Element that was visually selected
 */
function clearSelected(dependency) {
  if (dependency) {
    dependency.classList.remove('selected');
    dependencyPath.length = 0;
    path.innerHTML = '&nbsp;';
    path.removeAttribute('title');
  }
}

/**
 * Click event handler that visually selects the given tree node.
 *
 * @param {Element} dependency - the Element representing the tree node to select
 * @param {Event} e - click event
 */
function select(dependency, e) {
  clearFound();
  highlightAndPathify(dependency, false);
  lastSelectedDependency = dependency;
  e.stopPropagation();
}

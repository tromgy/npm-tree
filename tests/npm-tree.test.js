/* eslint-disable no-undef */
const dom = require('@testing-library/dom');
const { default: userEvent } = require('@testing-library/user-event');
const fs = require('fs');
const { JSDOM } = require('jsdom');
require('@testing-library/jest-dom');

let root;

// Object.prototype.scrollIntoView = () => {
//   console.log('scrolled');
// };

describe('npm-tree tests', () => {
  // All static page elements
  let expandAll;
  let collapseAll;
  let searchBox;
  let wholeWord;
  let findNext;
  let findPrev;
  let main;
  let footer;

  beforeAll(() => {
    const html = fs.readFileSync('./npm-tree.html', 'utf8');
    const jsdom = new JSDOM(html, { runScripts: 'dangerously' });
    root = jsdom.window.document.body;

    // Mock API not avaialable in the test DOM
    jsdom.window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('has UI', () => {
    expandAll = dom.getByTitle(root, 'Expand all');
    expect(expandAll).toBeInTheDocument();
    expect(expandAll).not.toBeEmptyDOMElement();

    collapseAll = dom.getByTitle(root, 'Collapse all');
    expect(collapseAll).toBeInTheDocument();
    expect(collapseAll).not.toBeEmptyDOMElement();

    searchBox = dom.getByRole(root, 'searchbox');
    expect(searchBox).toBeInTheDocument();
    expect(searchBox).toHaveAttribute('placeholder', '🔍');

    wholeWord = dom.getByTitle(root, 'Match whole word only');
    expect(wholeWord).toBeInTheDocument();

    findNext = dom.getByTitle(root, 'Find next');
    expect(findNext).toBeInTheDocument();
    expect(findNext).not.toBeEmptyDOMElement();

    findPrev = dom.getByTitle(root, 'Find previous');
    expect(findPrev).toBeInTheDocument();
    expect(findPrev).not.toBeEmptyDOMElement();

    main = dom.getByRole(root, 'main');
    expect(main).toBeInTheDocument();
    expect(main).not.toBeEmptyDOMElement();

    footer = dom.getByRole(root, 'contentinfo');
    expect(footer).toBeInTheDocument();
  });

  test('The tree can be expanded', () => {
    userEvent.click(expandAll);

    const leafDependency = dom.getAllByText(root, 'is-docker')[0];
    expect(leafDependency).toBeInTheDocument();
    expect(leafDependency).toBeVisible();
  });

  test('The tree can be collapsed', () => {
    userEvent.click(collapseAll);

    const leafDependency = dom.getAllByText(root, 'is-docker')[0];
    expect(leafDependency).toBeInTheDocument();
    expect(leafDependency).not.toBeVisible();
  });

  test('A tree branch can be expanded', () => {
    const bullets = dom.getAllByText(root, '▶︎');

    expect(bullets.length).toBeGreaterThan(0);

    expect(bullets[0]).toBeVisible();
    expect(bullets[1]).not.toBeVisible();

    const toggle = bullets[0];

    userEvent.click(toggle);

    expect(bullets[1]).toBeVisible();

    // And the toggled bullet should change
    expect(toggle).toHaveTextContent('▼');
  });

  test('A tree branch can be collapsed', () => {
    const bulletsExpand = dom.getAllByText(root, '▶︎');
    const bulletsCollapse = dom.getAllByText(root, '▼');

    expect(bulletsExpand.length).toBeGreaterThan(0);
    expect(bulletsCollapse.length).toBeGreaterThan(0);

    expect(bulletsExpand[0]).toBeVisible();

    const toggle = bulletsCollapse[0];

    userEvent.click(toggle);

    expect(bulletsExpand[0]).not.toBeVisible();

    // And the toggled bullet should change
    expect(toggle).toHaveTextContent('▶︎');
  });

  test('Search works', async () => {
    userEvent.type(searchBox, 'has');

    const firstResult = dom.getAllByText(root, 'has-flag')[0];

    await dom.waitFor(() => {
      expect(firstResult).toHaveClass('selected');
      expect(firstResult).toBeVisible();
      expect(firstResult.scrollIntoView).toBeCalled();

      const expectedPath =
        'npm-tree ▷ @testing-library/dom ▷ @babel/code-frame ▷ @babel/highlight ▷ chalk ▷ supports-color ▷ has-flag';
      const expectedToolTip = expectedPath.replace(/▷/g, '>');

      expect(footer).toHaveTextContent(expectedPath);
      expect(footer).toHaveAttribute('title', expectedToolTip);
    });
  });

  test('Find next works', async () => {
    userEvent.click(findNext);

    const prevResult = dom.getAllByText(root, 'has-flag')[0];
    const thisResult = dom.getAllByText(root, 'has-flag')[1];

    expect(prevResult).not.toHaveClass('selected');
    expect(thisResult).toHaveClass('selected');
    expect(thisResult).toBeVisible();
    expect(thisResult.scrollIntoView).toBeCalled();

    const expectedPath = 'npm-tree ▷ @testing-library/dom ▷ chalk ▷ supports-color ▷ has-flag';
    const expectedToolTip = expectedPath.replace(/▷/g, '>');

    expect(footer).toHaveTextContent(expectedPath);
    expect(footer).toHaveAttribute('title', expectedToolTip);
  });

  test('Find previous works', async () => {
    userEvent.click(findPrev);

    const prevResult = dom.getAllByText(root, 'has-symbols')[0];
    const thisResult = dom.getAllByText(root, 'has-flag')[0];

    expect(prevResult).not.toHaveClass('selected');
    expect(thisResult).toHaveClass('selected');
    expect(thisResult).toBeVisible();
    expect(thisResult.scrollIntoView).toBeCalled();

    const expectedPath =
      'npm-tree ▷ @testing-library/dom ▷ @babel/code-frame ▷ @babel/highlight ▷ chalk ▷ supports-color ▷ has-flag';
    const expectedToolTip = expectedPath.replace(/▷/g, '>');

    expect(footer).toHaveTextContent(expectedPath);
    expect(footer).toHaveAttribute('title', expectedToolTip);
  });

  test('Search wraps around', async () => {
    // Wrap to the end
    userEvent.click(findPrev);

    let prevResult = dom.getAllByText(root, 'has-flag')[0];
    let thisResult = dom.getAllByText(root, 'jest-haste-map').pop();

    expect(prevResult).not.toHaveClass('selected');
    expect(thisResult).toHaveClass('selected');
    expect(thisResult).toBeVisible();
    expect(thisResult.scrollIntoView).toBeCalled();

    let expectedPath = 'npm-tree ▷ jest ▷ @jest/core ▷ jest-snapshot ▷ jest-haste-map';
    let expectedToolTip = expectedPath.replace(/▷/g, '>');

    expect(footer).toHaveTextContent(expectedPath);
    expect(footer).toHaveAttribute('title', expectedToolTip);

    // Wrap to the beginning
    userEvent.click(findNext);

    prevResult = thisResult;
    thisResult = dom.getAllByText(root, 'has-flag')[0];

    expect(prevResult).not.toHaveClass('selected');
    expect(thisResult).toHaveClass('selected');
    expect(thisResult).toBeVisible();
    expect(thisResult.scrollIntoView).toBeCalled();

    expectedPath =
      'npm-tree ▷ @testing-library/dom ▷ @babel/code-frame ▷ @babel/highlight ▷ chalk ▷ supports-color ▷ has-flag';
    expectedToolTip = expectedPath.replace(/▷/g, '>');

    expect(footer).toHaveTextContent(expectedPath);
    expect(footer).toHaveAttribute('title', expectedToolTip);
  });

  test('Regexp search works', async () => {
    userEvent.clear(searchBox);
    userEvent.type(searchBox, '@.*_');

    const firstResult = dom.getAllByText(root, '@types/testing-library__jest-dom')[0];

    await dom.waitFor(() => {
      expect(firstResult).toHaveClass('selected');
      expect(firstResult).toBeVisible();
      expect(firstResult.scrollIntoView).toBeCalled();

      const expectedPath = 'npm-tree ▷ @testing-library/jest-dom ▷ @types/testing-library__jest-dom';
      const expectedToolTip = expectedPath.replace(/▷/g, '>');

      expect(footer).toHaveTextContent(expectedPath);
      expect(footer).toHaveAttribute('title', expectedToolTip);
    });
  });

  test('Whole-word search works', async () => {
    userEvent.clear(searchBox);
    userEvent.type(searchBox, 'has');
    userEvent.click(wholeWord);

    const firstResult = dom.getAllByText(root, 'has')[0];

    await dom.waitFor(() => {
      expect(firstResult).toHaveClass('selected');
      expect(firstResult).toBeVisible();
      expect(firstResult.scrollIntoView).toBeCalled();

      const expectedPath = 'npm-tree ▷ eslint-config-airbnb-base ▷ object.entries ▷ es-abstract ▷ has';
      const expectedToolTip = expectedPath.replace(/▷/g, '>');

      expect(footer).toHaveTextContent(expectedPath);
      expect(footer).toHaveAttribute('title', expectedToolTip);
    });
  });

  test('Dependency can be highlighted by click', () => {
    const itemToClick = dom.getAllByText(root, 'is-negative-zero')[0];
    const previouslySelected = dom.getAllByText(root, 'has')[0];

    expect(
      previouslySelected.parentElement.parentElement.parentElement ===
        itemToClick.parentElement.parentElement.parentElement
    ).toBeTruthy();
    expect(itemToClick).toBeInTheDocument();
    expect(itemToClick).toBeVisible();

    userEvent.click(itemToClick);

    expect(itemToClick).toHaveClass('selected');
    expect(previouslySelected).not.toHaveClass('selected');

    const expectedPath = 'npm-tree ▷ eslint-config-airbnb-base ▷ object.entries ▷ es-abstract ▷ is-negative-zero';
    const expectedToolTip = expectedPath.replace(/▷/g, '>');

    expect(footer).toHaveTextContent(expectedPath);
    expect(footer).toHaveAttribute('title', expectedToolTip);
  });

  test('Highlight can be cleared by click', () => {
    const previouslySelected = dom.getAllByText(root, 'is-negative-zero')[0];

    userEvent.click(main);

    expect(previouslySelected).not.toHaveClass('selected');

    const expectedPath = '&nbsp;'; // testing implementation 😬

    expect(footer).toContainHTML(expectedPath);
    expect(footer).not.toHaveAttribute('title');
  });
});

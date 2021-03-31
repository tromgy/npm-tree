const dropModal = document.getElementById('drop-modal');
const dropZone = document.getElementById('drop-zone');
const dropError = document.getElementById('drop-error');
const fileInput = document.getElementById('browse-files');

/**
 * Processes file drop.
 *
 * @param {Event} e - the drop event
 */
function dropOver(e) {
  e.preventDefault();

  if (e.dataTransfer.items) {
    if (e.dataTransfer.items[0].kind === 'file') {
      const file = e.dataTransfer.items[0].getAsFile();
      generateTreeFrom(file);
    } else {
      console.warn('not a file');
    }
  }
}

/**
 * Processes the drag event.
 *
 * @param {Event} e - the drag event
 */
function dragOver(e) {
  // Prevent the browser from simply opening the file
  e.preventDefault();
}

/**
 * Simulates the click on the invisible file input element.
 */
function triggerGetFile() {
  fileInput.click();
}

/**
 * Receives the File object from the file input element.
 *
 * @param {Element} input - the file input element.
 */
function getFile(input) {
  const file = input.files[0];
  generateTreeFrom(file);
}

/**
 * Processes the file content to generate the dependency tree.
 *
 * @param {File} file - the File object
 */
function generateTreeFrom(file) {
  file.text().then((content) => {
    try {
      const genHTML = processList(content);
      treeContainer.innerHTML = genHTML;
      dropModal.classList.add('hidden');
    } catch (err) {
      hide(dropZone);
      display(dropError);
    } finally {
      fileInput.value = '';
    }
  });
}

function closeErrorMessage() {
  hide(dropError);
  display(dropZone);
}

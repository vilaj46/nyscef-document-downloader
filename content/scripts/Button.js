function createButtons() {
  const viewDocuments = document.querySelectorAll('.NewSearchResults a');
  viewDocuments.forEach(viewDocument => {
    if (viewDocument.getAttribute('href').includes('ViewDocument?')) {
      const parent = viewDocument.parentNode;
      const data = {
        name: getDocumentName(parent.children[0]),
        downloadStatus: true,
        customName: '',
        id: viewDocument.href,
      };
      const addButton = createButton(data);
      parent.appendChild(addButton);
    }
  });
}

function createButton(data) {
  const button = document.createElement('button');
  button.id = data.id;
  button.addEventListener('click', event => {
    event.preventDefault();
    sendAddOrRemoveMessage(event.target, data);
  });
  styleAddButton(button);
  return button;
}

function styleAddButton(button) {
  button.classList.remove('remove');
  button.classList.add('add', 'button');
  button.innerText = 'Add to List';
  button.name = 'Add';
}

function showRemoveButton(button) {
  button.classList.remove('add');
  button.classList.add('remove');
  button.innerText = 'Remove from List';
  button.name = 'Remove';
}

function resetSelectedButtons() {
  const buttons = Array.from(document.getElementsByClassName('button'));
  buttons.forEach(button => {
    const classList = Array.from(button.classList);
    if (classList.includes('remove')) {
      styleAddButton(button);
    }
  });
}

function updateDocumentStatus(id) {
  const buttons = document.querySelectorAll('.button');
  buttons.forEach(button => {
    if (button.id === id) {
      if (Array.from(button.classList).includes('add')) {
        showRemoveButton(button);
      } else {
        styleAddButton(button);
      }
    }
  });
}

const CREATE = {
    addButton,
    clearButton,
    documentItem,
    documentItemForm,
    documentItemInput,
    documentList,
    downloadButton,
    errorButton,
    formOptions,
    inlineError,
    removeButton,
    toggleSign,
    topMessage,
    undoButton,
}

function addButton(doc) {
    const button = document.createElement('button');

    button.type = 'button';
    button.innerText = 'Add';
    button.classList.add('add-button');
    button.setAttribute('disabled', 'disabled');
    
    button.addEventListener('click', (event) => {
        const parentDiv = event.target.parentElement;
        const input = parentDiv.previousSibling;
        const listItem = input.parentElement.parentElement;
        const toggleSign = input.previousSibling;
        const removeButton = event.target.nextSibling;

        if (Array.from(toggleSign.classList).includes('cross-toggle')) {
            toggleSign.classList.remove('cross-toggle');
        }

        event.target.setAttribute('disabled', 'disabled');
        removeButton.removeAttribute('disabled');

        if (Array.from(input.classList).includes('line-through')) {
            input.classList.remove('line-through');
            MESSAGE.updateDocumentStatus(doc.id)
        } else {
            return;
        }
    });
    return button;
}

function clearButton(enabled) {
    const button = document.createElement('button');
    
    button.id = 'clear-button';
    button.innerText = 'Clear';
    button.type = 'button';

    if (enabled) {
        button.removeAttribute('disabled');
    } else {
        button.setAttribute('disabled', 'disabled');
    }

    button.addEventListener('click', (event) => {
        UI.refreshSidebar();
    });
    return button;
}

function documentItem(doc) {
    const li = document.createElement('li');
    const form = CREATE.documentItemForm(doc);
    li.id = doc.id;
    li.classList.add('document');
    li.append(form);
    return li;
}

function documentItemForm(doc) {
    const form = document.createElement('form');
    const toggleSign = CREATE.toggleSign();
    const input = CREATE.documentItemInput(doc)
    const formOptions = CREATE.formOptions(doc);
    const undoButton = CREATE.undoButton(doc);

    form.append(toggleSign);
    form.append(input);
    formOptions.append(undoButton);
    form.append(formOptions);
    // form.append(CREATE.undoButton(doc));
    form.addEventListener('submit', (event) => event.preventDefault());

    return form;
}

function documentItemInput(doc) {
    const input = document.createElement('input');
    let timeout;
    input.value = doc.name;
    input.classList.add('document-input');

    input.addEventListener('input', (event) => {
        const li = event.target.parentElement.parentElement;
        const undoButton = li.querySelector('.undo-button');
        
        if (isValidDocumentName(event.target.value)) {
            MESSAGE.setCustomName(event.target.value, doc.id);
        } else {
            event.target.value = event.target.value.slice(0, event.target.value.length - 1);
            timeout = displaySpecialCharacters(li, timeout);
            MESSAGE.setTopMessage('Special characters include \\, /, :, *, ?, ", <, >, |');
        }

        if (event.target.value === doc.name) {
            undoButton.setAttribute('disabled', 'disabled');
        } else {
            undoButton.removeAttribute('disabled'); 
        }
    });
    return input;
}

function documentList(documents) { 
    const ul = document.createElement('ul');
    ul.id = 'document-list';
    documents.forEach(doc => {
        ul.append(createDocumentItem(doc));
    }); 
    return ul;
}

function downloadButton(enabled) {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerText = 'Download';
    button.id = 'download-button';

    if (enabled) {
        button.removeAttribute('disabled');
    } else {
        button.setAttribute('disabled', 'disabled');
    }
    
    button.addEventListener('click', (event) => {
        UI.disableButton('clear-button');
        UI.disableButton('download-button');
        MESSAGE.downloadDocuments();
    });
    return button;
}

function errorButton(errors) {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerText = 'Error Log';
    button.id = 'error-log-button';
    button.addEventListener('click', (event) => {
        UI.showErrors();
        UI.disableButton('error-log-button');
    });

    if (errors.length > 0) {
        button.removeAttribute('disabled');
        button.classList.add('error-log-pop');
        setTimeout(() => {
            button.classList.remove('error-log-pop');
        }, 100);
    } else {
        button.setAttribute('disabled', 'disabled');
    }

    return button;
}

function formOptions(doc) {
    const div = document.createElement('div');
    const addButton = CREATE.addButton(doc);
    const removeButton = CREATE.removeButton(doc);

    div.classList.add('form-options');
    div.append(addButton);
    div.append(removeButton);
    return div;
}

function inlineError() {
    const p = document.createElement('p');
    p.classList.add('inline-error');
    p.innerText = 'Please do not use special characters.';
    p.style.color = 'rgb(241, 78, 78)';
    return p;
}

function removeButton(doc) {
    const button = document.createElement('button');

    button.type = 'button';
    button.innerText = 'Remove';
    button.classList.add('remove-button');
    button.addEventListener('click', (event) => {
        const parentDiv = event.target.parentElement;
        const input = parentDiv.previousSibling;
        const listItem = input.parentElement.parentElement;
        const toggleSign = input.previousSibling;
        const addButton = event.target.previousSibling;

        if (!Array.from(toggleSign.classList).includes('cross-toggle')) {
            toggleSign.classList.add('cross-toggle');
        }

        addButton.removeAttribute('disabled'); 
        event.target.setAttribute('disabled', 'disabled');

        if (Array.from(input.classList).includes('line-through')) {
            return;
        } else {
            input.classList.add('line-through');
            MESSAGE.updateDocumentStatus(doc.id)
        }
    });
    return button;
}

function toggleSign() {
    const div = document.createElement('div'); 
    div.classList.add('cross');
    div.addEventListener('click', (event) => {
        event.target.classList.toggle('cross-toggle');

        const listItem = event.target.parentElement.parentElement;
        const input = event.target.parentElement.querySelector('input');
        const undoButton = listItem.querySelector('.undo-button');
        const addButton = listItem.querySelector('.add-button');
        const removeButton = listItem.querySelector('.remove-button');
        const lineThrough = Array.from(event.target.classList).includes('cross-toggle');
        

        if (lineThrough) {
            input.classList.add('line-through');
            removeButton.setAttribute('disabled', 'disabled');
            addButton.removeAttribute('disabled');
        } else {
            input.classList.remove('line-through');
            removeButton.removeAttribute('disabled');
            addButton.setAttribute('disabled', 'disabled');
        }
        return MESSAGE.updateDocumentStatus(listItem.id);
    });
    return div;
}

function topMessage() {
    const p = document.createElement('p');
    p.id = 'top-message';
    p.classList.add('show');
    p.innerText = 'Add documents to the list!';
    return p;
}

function undoButton(doc) {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerText = 'Undo';
    button.classList.add('undo-button');
    button.setAttribute('disabled', 'disabled');
    button.addEventListener('click', (event) => {
        const parent = event.target.parentElement;
        const input = parent.previousSibling;
        input.value = doc.name;
        MESSAGE.returnDocumentName(event.target, doc.id);
    });

    return button;
}
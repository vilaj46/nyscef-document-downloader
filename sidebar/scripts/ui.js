document.addEventListener('DOMContentLoaded', () => {
    UI.clearDocumentList(true).then(() => {
        setupLayout();
    });
});

const UI = {
    addDocumentToList,
    clearDocumentList,
    clearErrorList,
    completeDocumentDownload,
    disableButton,
    disableButtons,
    displaySpecialCharacters,
    enableButton,
    errorAdded,
    hideTopMessage,
    isValidDocumentName,
    refreshSidebar,
    removeDocumentFromList,
    setupLayout,
    showErrors,
    showTopMessage,
    toggleDocument,
}

function addDocumentToList({ doc }) {
    const documentList = document.getElementById('document-list');
    const errorList = document.getElementById('error-list');
    if (Array.from(documentList.children).length === 0) {
        UI.enableButton('download-button');
        UI.enableButton('clear-button');
        MESSAGE.getTopMessage().then(() => {
            const topMessage = document.getElementById('top-message');
            UI.showTopMessage(topMessage);
        })
    }
    documentList.append(CREATE.documentItem(doc));
}

function clearDocumentList(initialLoad) {
    const documents = document.querySelectorAll('.document');
    initialLoad = initialLoad ? initialLoad : false;
    if (documents.length > 0) {
        const documentList = document.getElementById('document-list');
        documents.forEach(doc => {
            documentList.removeChild(doc);
        });
    }
    return MESSAGE.clearDocumentList(initialLoad);
}

function clearErrorList() {
    const errorList = document.getElementById('error-list');
    if (errorList) {
        document.body.removeChild(errorList);
    }
}

function completeDocumentDownload(id) {
    const li = document.getElementById(id);
    const input = li.querySelector('input');
    input.style.backgroundColor = 'rgb(40, 167, 69)';
}

function disableButton(id) {
    const button = document.getElementById(id);
    button.setAttribute('disabled', 'disabled');
}

function disableButtons() {
    const downloadButton = document.getElementById('download-button');
    const clearButton = document.getElementById('clear-button');
    const errorLogButton = document.getElementById('error-log-button');
    errorLogButton.setAttribute('disabled', 'disabled');
    downloadButton.setAttribute('disabled', 'disabled');
    clearButton.setAttribute('disabled', 'disabled');
}

function displaySpecialCharacters(li, timeout) {
    let inlineError = li.querySelector('.inline-error');
    if (!inlineError) {
        li.append(CREATE.inlineError());
        timeout = setTimeout(() => {
            li.removeChild(li.querySelector('.inline-error'));
        }, 3000); 
    } else {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            li.removeChild(li.querySelector('.inline-error'));
        }, 3000); 
    }
    return timeout;
}

function enableButton(id) {
    const button = document.getElementById(id);
    button.removeAttribute('disabled');
}

function errorAdded() {
    const errorLogButton = document.getElementById('error-log-button');
    if (errorLogButton) {
        errorLogButton.classList.add('error-log-pop');
        errorLogButton.removeAttribute('disabled');
        setTimeout(() => {
            errorLogButton.classList.remove('error-log-pop');
        }, 100);
    }  
}

function hideTopMessage() {
    const topMessage = document.getElementById('top-message');
    topMessage.classList.remove('show');
    topMessage.classList.add('hide');
}

function isValidDocumentName(name) {
    const backSlash = '\\'; // Not escaping key in the array.
    const bannedChars = ["/", ":", "*", "?", "\"", "<", ">", "|"];
    if (name.includes(backSlash)) {
      return false;
    } else {
      for (let i = 0; i < bannedChars.length; i++) {
        if (name.includes(bannedChars[i])) {
          return false;
        }
      }
    }
    return true;
}

function refreshSidebar() {
    UI.clearDocumentList();
    UI.clearErrorList();

    const downloadButton = document.getElementById('download-button');
    downloadButton.innerText = 'Download';

    return MESSAGE.getErrors().then(errors => {
        const topMessage = document.getElementById('top-message');
        UI.disableButtons();
        if (errors.length > 0) {
            enableButton('error-log-button');
        } 

        if (topMessage) {
            MESSAGE.getTopMessage(topMessage).then(p => {
                UI.showTopMessage(p);
            }).catch(error => MESSAGE.sendErrorToBackground(error));
        } else {
            CREATE.topMessage();
        }
    }).catch(error => MESSAGE.sendErrorToBackground(error));
}

function removeDocumentFromList({ doc, length }) {
    const documentList = document.getElementById('document-list');
    documentList.removeChild(document.getElementById(doc.id));
    if (length === 0) {
        UI.disableButton('clear-button');
        UI.disableButton('download-button');
        MESSAGE.getTopMessage().then(p => {
            UI.showTopMessage(p);
        }).catch(error => MESSAGE.sendErrorToBackground(error));
    }
}

function setupLayout() {
    const section = document.createElement('section');
    section.id = 'button-section';
    return MESSAGE.getDocuments().then(documents => {
        const enableButton = !!documents.length; 
        MESSAGE.getErrors().then(errors => {
            section.append(CREATE.errorButton(errors));
            section.append(CREATE.downloadButton(enableButton));
            section.append(CREATE.clearButton(enableButton));
            document.body.append(section);
            document.body.append(CREATE.topMessage());
            document.body.append(CREATE.documentList(documents));
        }).catch(error => { MESSAGE.sendErrorToBackground(error) });
    }).catch(error => { MESSAGE.sendErrorToBackground(error) });
}

function showErrors() {
    const ul = document.createElement('ul');
    const clearButton = document.getElementById('clear-button');
    const topMessage = document.getElementById('top-message');
    const downloadButton = document.getElementById('download-button');

    ul.id = 'error-list'; 
    MESSAGE.getErrors().then(errors => {
        UI.clearErrorList();

        errors.forEach(error => {
            const li = document.createElement('li');
            li.innerText = error;
            ul.append(li);
        });
        UI.clearDocumentList();
    
        if (clearButton.getAttribute('disabled')) {
            UI.enableButton('clear-button');
        }

        if (!downloadButton.getAttribute('disabled')) {
            UI.disableButton('download-button');
        }

        if (Array.from(topMessage.classList).includes('show')) {
            UI.hideTopMessage();
        }
        return document.body.append(ul);
    }).catch(error => MESSAGE.sendErrorToBackground(error));
}

function showTopMessage(p) {
    p.classList.remove('hide');
    p.classList.add('show');
}

function toggleDocument({ length, id }) {
    const documents = Array.from(document.querySelectorAll('.document'));
    const doc = documents.find(doc => doc.id === id);
    if (doc) {
        const toggleSign = doc.querySelector('.cross');
        const input = doc.querySelector('input');
        toggleSign.classList.toggle('cross-toggle');
        input.classList.toggle('line-through');
    }

    if (length > 0) {
       UI.hideTopMessage();
        // Throttles function calls 
        if (length === 1) { 
            UI.enableButton('download-button');
        }
    } else {
        UI.disableButton('clear-button');
        UI.disableButton('download-button');
    }
}


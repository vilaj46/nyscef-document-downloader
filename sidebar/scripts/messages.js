browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'Add Document': 
            return UI.addDocumentToList(request);
        case 'Document Download Complete':
            return UI.completeDocumentDownload(request.id);
        case 'Error Added':
            return UI.errorAdded();
        case 'Get Errors':
            return MESSAGE.getErrors();
        case 'Refreshed':
            return UI.refreshSidebar();
        case 'Remove Document':
            return removeDocumentFromList(request);
        case 'Toggle Document Status':
            return toggleDocument(request, sendResponse); 
    }
});

const MESSAGE = {
    cancelDownload,
    clearDocumentList,
    downloadDocuments,
    getDocuments,
    getDocumentStatus,
    getErrors,
    getTopMessage,
    returnDocumentName,
    sendErrorToBackground,
    setCustomName,
    setTopMessage,
    updateDocumentStatus
}

function cancelDownload() {
    return browser.runtime.sendMessage({
        action: 'Cancel Download',
    }).catch(error => MESSAGE.sendErrorToBackground(error));
}

function clearDocumentList(initialLoad) {
    return browser.runtime.sendMessage({
        action: 'Clear Document List',
        initialLoad: initialLoad,
    }).catch(error => MESSAGE.sendErrorToBackground(error))
}



function downloadDocuments() {
    return browser.runtime.sendMessage({
        action: 'Download Documents',
    }).then(() => {
        MESSAGE.getTopMessage().then(p => {
            UI.showTopMessage(p);
            // UI.clearDocumentList();
            UI.disableButton('clear-button');
        });
    }).catch(error => MESSAGE.sendErrorToBackground(error));
}

function getDocuments() {
    return browser.runtime.sendMessage({
        action: 'Get Documents',
    }).then(response => {
        return response.documents;
    }).catch(error => MESSAGE.sendErrorToBackground(error));
}

function getDocumentStatus(id) {
    return browser.runtime.sendMessage({
        action: 'Get Document Status',
        id,
    }).catch(error => MESSAGE.sendErrorToBackground(error));
}

function getErrors(response) {
    return browser.runtime.sendMessage({
        action: 'Get Errors',
    })
    .then(response => response.errors)
    .catch(error => MESSAGE.sendErrorToBackground(error));
}

function getTopMessage() {
    let topMessage = document.getElementById('top-message');
    return browser.runtime.sendMessage({
        action: 'Get Top Message',
    }).then(({ message }) => {
        topMessage.innerText = message;
        return topMessage;
    }).catch(error => MESSAGE.sendErrorToBackground(error))
}

function returnDocumentName(undoButton, id) {
    return browser.runtime.sendMessage({
        action: 'Return Original Document Name',
        id
    }).then(() => {
        const selectedDoc = document.querySelector(`.document[id='${id}']`);
        const inlineError = selectedDoc.querySelector('.inline-error');
        undoButton.setAttribute('disabled', 'disabled');
        if (inlineError) {
            selectedDoc.removeChild(inlineError); 
        }   
    }).catch(error => MESSAGE.sendErrorToBackground(error));
}

function sendErrorToBackground(error) {
    return browser.runtime.sendMessage({
        action: 'Add Error',
        error: `${error}`
    });
}

function setCustomName(updatedName, id) {
    return browser.runtime.sendMessage({
        action: 'Set Custom Name',
        updatedName,
        id
    }).catch(error => MESSAGE.sendErrorToBackground(error));
}

function setTopMessage(message) {
    return browser.runtime.sendMessage({
        action: 'Set Top Message',
        message,
    }).then(() => {
        MESSAGE.getTopMessage().then(() => {
            const topMessage = document.getElementById('top-message');
            UI.showTopMessage(topMessage);
        });
    }).catch(error => MESSAGE.sendErrorToBackground(error));
}

function updateDocumentStatus(id) {
    return browser.runtime.sendMessage({
        action: 'Update Document Status',
        id,
    }).then(response => {
        if (response) {
            MESSAGE.getTopMessage().then(p => {
                UI.showTopMessage(p);
                UI.disableButton('download-button');
            });
        } else {
            const topMessage = document.getElementById('top-message');
            const clearButton = document.getElementById('clear-button');
            const downloadButton = document.getElementById('download-button');

            MESSAGE.getTopMessage().then(p => {
                UI.showTopMessage(p);
            });

            if (downloadButton.getAttribute('disabled')) {
                UI.enableButton('download-button');
            }
            
            if (clearButton.getAttribute('disabled')) {
                UI.enableButton('clear-button');
            }
        }
    }).catch(error => MESSAGE.sendErrorToBackground(error));
}

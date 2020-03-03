const addDocumentsMessage = 'Add documents to the list!';
const changeDocumentNameMessage = 'You can change document names!';

let DATA = {
  topMessage: addDocumentsMessage,
  documents: [],
  errors: [],
  addDocument: function(doc) {
    this.documents = removeDuplicateItems(doc, this.documents);
    this.topMessage = changeDocumentNameMessage;
    return this;
  },
  addError: function(error) {
    this.errors = removeDuplicateItems(`${error}`, this.errors);
    return browser.runtime
      .sendMessage({
        action: 'Error Added',
      })
      .then(() => this)
      .catch(error => DATA.addError(`${error}`));
  },
  clearDocuments: function() {
    this.documents = [];
    this.topMessage = addDocumentsMessage;
    return this;
  },
  downloadLength: function() {
    return this.documents.filter(doc => doc.downloadStatus).length;
  },
  getDocumentStatus: function({ id }) {
    let status = true;
    this.documents.forEach(doc => {
      if (doc.id === id) {
        status = doc.downloadStatus;
      }
    });
    return status;
  },
  removeCustomName: function({ id }) {
    return (this.documents = this.documents.map(doc => {
      if (doc.id === id) {
        doc.customName = '';
      }
      return doc;
    }));
  },
  removeDocument: function(doc) {
    const documents = this.documents.filter(({ id }) => id !== doc.id);
    if (documents.length === 0) {
      this.topMessage = addDocumentsMessage;
    } else {
      this.topMessage = changeDocumentNameMessage;
    }
    this.documents = documents;
    return this;
  },
  reset: function(everything) {
    if (everything) {
      DATA = {
        ...this,
        documents: [],
        errors: [],
        topMessage: addDocumentsMessage,
      };
    } else {
      DATA = {
        ...this,
        topMessage: addDocumentsMessage,
        documents: [],
        errors: this.errors,
      };
    }
    return this;
  },
  setCustomName: function({ updatedName, id }) {
    return this.documents.map(doc => {
      if (doc.id === id) {
        doc.customName = updatedName;
      }
      return doc;
    });
  },
  setTopMessage: function(message) {
    this.topMessage = message;
    return this;
  },
  updateDocumentStatus: function(id) {
    return this.documents.map(doc => {
      if (doc.id === id) {
        doc.downloadStatus = !doc.downloadStatus;
      }
      return doc;
    });
  },
};

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'Add Error':
      return DATA.addError(request.error);
    case 'Add or Remove Document':
      return addOrRemoveDocument(request, sendResponse);
    case 'Clear Document List':
      return clearDocumentList(request.initialLoad);
    case 'Download Documents':
      return downloadDocuments();
    case 'Finished Downloading':
      return DATA.reset();
    case 'Get Documents':
      return sendResponse({ documents: DATA.documents });
    case 'Get Document Status':
      return sendResponse({ status: DATA.getDocumentStatus(request.id) });
    case 'Get Errors':
      return sendResponse({ errors: DATA.errors });
    case 'Get Top Message':
      return sendResponse({ message: DATA.topMessage });
    case 'Refreshed':
      return DATA.reset(true);
    case 'Return Original Document Name':
      return DATA.removeCustomName(request);
    case 'Set Custom Name':
      return DATA.setCustomName(request);
    case 'Set Top Message':
      return DATA.setTopMessage(request.message);
    case 'Update Document Status':
      return updateDocumentStatus(request.id, sendResponse);
  }
});

function addOrRemoveDocument(request, sendResponse) {
  const { act } = request;
  const duplicate = isDuplicateDocument(request.document, DATA.documents);
  if (act === 'Add') {
    DATA.addDocument(request.document);
    if (!duplicate) {
      return browser.runtime
        .sendMessage({
          action: `${act} Document`,
          doc: request.document,
        })
        .catch(error => DATA.addError(error));
    } else {
      return browser.runtime
        .sendMessage({
          action: 'Toggle Document Status',
          id: request.document.id,
          length: DATA.downloadLength(),
        })
        .catch(error => DATA.addError(error));
    }
  } else {
    // act === 'Remove'
    DATA.removeDocument(request.document);
    return browser.runtime
      .sendMessage({
        action: `${act} Document`,
        doc: request.document,
        length: DATA.documents.length,
      })
      .catch(error => DATA.addError(error));
  }
}

function clearDocumentList(initialLoad) {
  DATA.clearDocuments();
  return browser.tabs
    .query({ active: true, currentWindow: true })
    .then(tabs => {
      browser.tabs
        .sendMessage(tabs[0].id, {
          action: 'Refreshed',
        })
        .catch(error => {
          if (!initialLoad) {
            DATA.addError(error);
          }
        });
    })
    .catch(error => DATA.addError(error));
}

function downloadDocuments() {
  const downloads = DATA.documents.filter(doc => doc.downloadStatus);
  DATA.reset(true);
  return browser.tabs
    .query({ active: true, currentWindow: true })
    .then(tabs => {
      browser.tabs
        .sendMessage(tabs[0].id, {
          action: 'Download Documents',
          documents: downloads,
        })
        .catch(error => DATA.addError(error));
    })
    .catch(error => DATA.addError(error));
}

function isDuplicateDocument(doc, documents) {
  let duplicate = false;
  documents.forEach(documentObject => {
    if (doc.id === documentObject.id) duplicate = true;
  });
  return duplicate;
}

function removeDuplicateItems(doc, documents) {
  documents.push(doc);
  let uniqueDocuments = documents.filter((error, index, self) => {
    return self.indexOf(error) === index;
  });
  return uniqueDocuments;
}

function updateDocumentStatus(id, sendResponse) {
  DATA.updateDocumentStatus(id);

  browser.tabs
    .query({ active: true, currentWindow: true })
    .then(tabs => {
      browser.tabs
        .sendMessage(tabs[0].id, {
          action: 'Update Document Status',
          id,
        })
        .catch(error => DATA.addError(error));
    })
    .catch(error => DATA.addError(error));

  if (DATA.downloadLength() === 0) {
    DATA.setTopMessage(addDocumentsMessage);
    return sendResponse({
      message: addDocumentsMessage,
    });
  } else {
    DATA.setTopMessage(changeDocumentNameMessage);
  }
}

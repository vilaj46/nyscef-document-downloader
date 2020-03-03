addStyleSheet();
sendRefreshMessage();
createButtons();

browser.runtime.onMessage.addListener(request => {
  switch (request.action) {
    case 'Download Documents':
      return downloadDocuments(request);
    case 'Refreshed':
      return resetSelectedButtons();
    case 'Update Document Status':
      return updateDocumentStatus(request.id);
  }
});

function addStyleSheet() {
  const linkElement = document.createElement('link');
  linkElement.setAttribute('rel', 'stylesheet');
  linkElement.setAttribute(
    'href',
    browser.extension.getURL('./content/index.css')
  );
  document.getElementsByTagName('head')[0].appendChild(linkElement);
}

function downloadDocuments({ documents }) {
  const fetchArray = documents.map(doc => fetch(doc.id));
  displaySpinners(documents);
  fetchArray.forEach((value, index) => {
    value
      .then(res => res.blob())
      .then(blob => {
        const { name, customName, id } = documents[index];
        const filename = customName ? customName : name;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.pdf`;
        document.body.appendChild(a);
        const button = document.getElementById(id);
        const parent = button.parentElement;
        styleAddButton(button);
        parent.removeChild(parent.querySelector('.loading'));
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        if (index === documents.length - 1) {
          browser.runtime
            .sendMessage({
              action: 'Finished Downloading',
            })
            .catch(error => sendErrorToBackground(error));
        }
        {
          // report back to sidebar
          console.log(id);
          browser.runtime
            .sendMessage({
              action: 'Document Download Complete',
              id,
            })
            .catch(error => sendErrorToBackground(error));
          // updating document download status
          // if completed slide green bar across input
          // if incomplete slide red bar across input
        }
      })
      .catch(err => sendErrorToBackground(err));
  });
}

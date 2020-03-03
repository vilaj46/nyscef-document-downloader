const { sendMessage } = browser.runtime;

function sendAddOrRemoveMessage(button, data) {
  sendMessage({
    action: 'Add or Remove Document',
    document: data,
    act: button.name,
  })
    .then(() => {
      if (button.name === 'Add') {
        styleRemoveButton(button);
      } else {
        styleAddButton(button);
      }
    })
    .catch(error => sendErrorToBackground(error));
}

function sendErrorToBackground(error) {
  return browser.runtime.sendMessage({
    action: 'Add Error',
    error: `${error}`,
  });
}

function sendRefreshMessage() {
  return (window.onbeforeunload = () => {
    resetSelectedButtons();
    browser.runtime
      .sendMessage({
        action: 'Refreshed',
      })
      .catch(error => sendErrorToBackground(error));
  });
}

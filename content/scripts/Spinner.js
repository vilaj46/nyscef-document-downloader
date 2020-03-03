function createSpinner() {
  const spinner = document.createElement('div');
  spinner.classList.add('loading');
  return spinner;
}

function displaySpinners(documents) {
  let links = Array.from(document.querySelectorAll('.NewSearchResults a'));
  documents.forEach(doc => {
    links.forEach(link => {
      if (doc.id === link.href) {
        const spinner = createSpinner();
        link.parentNode.appendChild(spinner);
      }
    });
  });
}

function clearCorrectedText(text) {
  let exhibit;
  if (text.includes('*')) {
    exhibit = text.slice(0, text.indexOf('*'));
    return exhibit;
  }
  return text;
}

function getDocumentName(anchor) {
  let name = anchor.innerHTML.replace(/\\/gi, '_');
  name = name.replace(/[/:*?"<>|]/gi, '_');
  if (anchor.innerHTML.includes('EXHIBIT')) {
    // Exhibit Letter or Number followed usually by a Motion #.
    let { textContent } = anchor.nextSibling;
    return name + getExhibit(textContent);
  } else {
    return name;
  }
}

function getExhibit(text) {
  let trimmedText = clearCorrectedText(text);
  trimmedText = trimmedText
    .trim()
    .split('')
    .filter(char => {
      return char !== ' ' && char !== '\n';
    })
    .join('');
  return trimmedText;
}

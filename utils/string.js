const punycode = require('punycode');

function cleanString(value) {
  return value ? value.replace(/\r?\n|\r|\t|"|!|“|”|•/g, '').replace(/  +/g, ' ').trim() : '';
}

function cleanStart(value) {
  return value ? value.replace(/^, /, '') : value;
}

function revertMathematicalBold(text) {
  if (!text) {
    return text;
  }

  const response = punycode.ucs2.decode(text).map((value) => {
    let newValue = value;
    if (value >= 120782) { // numbers
      newValue = value - 120734;
    } else if (value >= 119834) { // lower letters
      newValue = value - 119834 + 97;
    } else if (value >= 119808) { // upper letters
      newValue = value - 119808 + 65;
    }

    return punycode.ucs2.encode([newValue]);
  });

  return response.join('');
}

function getUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0; // eslint-disable-line
    const v = c === 'x' ? r : (r & 0x3 | 0x8); // eslint-disable-line

    return v.toString(16);
  });
}

module.exports = {
  cleanString,
  cleanStart,
  revertMathematicalBold,
  getUUID,
};

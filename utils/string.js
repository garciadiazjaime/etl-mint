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

module.exports = {
  cleanString,
  cleanStart,
  revertMathematicalBold,
};

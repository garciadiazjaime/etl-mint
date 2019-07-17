function cleanString(value) {
  return value ? value.replace(/\r?\n|\r|\t|"|!|“|”|•/g, '').replace(/  +/g, ' ').trim() : '';
}

function cleanStart(value) {
  return value ? value.replace(/^, /, '') : value;
}

module.exports.cleanString = cleanString;
module.exports.cleanStart = cleanStart;

const { getOptions, getPhones } = require('../../utils/entities');

function getMeta(post, location) {
  const { caption } = post;
  let rank = 0;

  const phones = getPhones(caption);
  const options = getOptions(caption);

  if (phones.length) {
    rank += 30;
  }

  if (location && location.id) {
    rank += 15;

    if (location.latitude) {
      rank += 5;
    }
  }

  if (options.length) {
    rank += 10;
  }

  return {
    phones,
    options,
    rank,
  };
}


module.exports.getMeta = getMeta;

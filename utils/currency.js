function getCurrency(value) {
  if (!value) {
    return '';
  }

  if (value.search(/USD|MDD|US/i) !== -1) {
    return 'USD';
  }

  if (value.search(/MXN|MDP|MN|M\.N\./i) !== -1) {
    return 'MXN';
  }

  return '';
}

function getMultiplier(value) {
  if (!value) {
    return 1;
  }

  if (value.search(/mil/i) !== -1) {
    return 1000;
  }

  if (value.search(/mdp|mdd/i) !== -1) {
    return 1000000;
  }

  return 1;
}

function getPrice(value) {
  if (!value) {
    return '';
  }

  const results = value.replace(/,/g, '').match(/\d+\.?\d*/);

  if (results && results.length) {
    const price = parseFloat(results[0]);

    const multiplier = getMultiplier(value);

    return price * multiplier;
  }

  return '';
}

module.exports.getPrice = getPrice;
module.exports.getCurrency = getCurrency;

const request = require('request-promise');
const debug = require('debug');

const config = require('../config');

function load(apiUrl, places) {
  if (!places || !places.length) {
    return null;
  }

  const options = {
    method: 'POST',
    uri: `${apiUrl}/real-state/place`,
    body: {
      places,
    },
    json: true,
  };

  return request(options);
}

class RealState {
  log(message) {
    debug(`app:${this.site}`)(message);
  }

  async loadHelper({
    maxRequest, waitSecs, domain, path, pageNumber,
  }) {
    if (pageNumber > maxRequest) {
      return;
    }

    const url = domain + path + pageNumber;
    this.log(`extracting from ${url}`);

    const html = await this.extract(url);
    const places = this.transform(html, domain);

    this.log(`loading ${places.length} places`);

    await load(config.get('api.url'), places);

    if (this.doNext(html)) {
      setTimeout(() => this.loadHelper({
        maxRequest, waitSecs, domain, path, pageNumber: pageNumber + 1,
      }), waitSecs);
    }
  }

  main() {
    const siteConfigs = config.get(`sites.${this.site}`);
    const {
      domain, path, active, maxRequest, waitSecs,
    } = siteConfigs;

    if (active) {
      this.loadHelper({
        maxRequest, waitSecs, domain, path, pageNumber: 1,
      });
    } else {
      this.log('etl disabled');
    }
  }
}

function getCurrency(value) {
  if (!value) {
    return '';
  }

  if (value.toUpperCase().includes('USD')) {
    return 'USD';
  }

  if (value.search(/MXN|MDP|MN/i) !== -1) {
    return 'MXN';
  }

  return '';
}

function getMultiplier(value) {
  if (!value) {
    return 1;
  }

  if (value.toLowerCase().includes('mil')) {
    return 1000;
  }

  if (value.toLowerCase().includes('mdp')) {
    return 1000000;
  }

  return 1;
}

function getPrice(value) {
  if (!value) {
    return '';
  }

  const results = value.match(/[\d]+\.?[\d]+/);

  if (results && results.length) {
    const price = parseFloat(results[0]);

    const multiplier = getMultiplier(value);

    return price * multiplier;
  }

  return '';
}

module.exports = RealState;
module.exports.getPrice = getPrice;
module.exports.getCurrency = getCurrency;

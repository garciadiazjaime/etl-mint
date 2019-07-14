const request = require('request-promise');
const debug = require('debug')('app:realstate');

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
  async loadHelper({
    maxRequest, waitSecs, domain, path, pageNumber,
  }) {
    if (pageNumber > maxRequest) {
      if (this.afterHook) {
        await this.afterHook();
      }
      return;
    }

    const url = domain + path;
    debug(`extracting:${this.site} ${url}, ${pageNumber}`);
    const html = await this.extract(url, pageNumber);

    const places = this.transform(html, domain);
    debug(`loading:${this.site} ${places.length} places`);
    await load(config.get('api.url'), places);

    if (this.doNext(html)) {
      setTimeout(() => this.loadHelper({
        maxRequest, waitSecs, domain, path, pageNumber: pageNumber + 1,
      }), waitSecs);
    } else if (this.afterHook) {
      await this.afterHook();
    }
  }


  async main() {
    const siteConfigs = config.get(`sites.${this.site}`);
    const {
      domain, path, active, maxRequest, waitSecs,
    } = siteConfigs;

    if (active) {
      if (this.preHook) {
        await this.preHook();
      }
      this.loadHelper({
        maxRequest, waitSecs, domain, path, pageNumber: 1,
      });
    } else {
      debug('etl disabled');
    }
  }
}

function getCurrency(value) {
  if (!value) {
    return '';
  }

  if (value.search(/USD|MDD/i) !== -1) {
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

function cleanString(value) {
  return value ? value.replace(/\r?\n|\r|\t|"|!|“|”/g, '').replace(/  +/g, ' ').trim() : '';
}

function cleanStart(value) {
  return value ? value.replace(/^, /, '') : value;
}

module.exports = RealState;
module.exports.getPrice = getPrice;
module.exports.getCurrency = getCurrency;
module.exports.cleanString = cleanString;
module.exports.cleanStart = cleanStart;

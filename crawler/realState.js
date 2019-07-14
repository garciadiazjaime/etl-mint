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
    debug(`extracting:${this.source} ${url}, ${pageNumber}`);
    const html = await this.extract(url, pageNumber);

    const places = this.transform(html, domain);
    debug(`loading:${this.source} ${places.length} places`);
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
    const siteConfigs = config.get(`sites.${this.source}`);
    const {
      domain, path, active, maxRequest, waitSecs,
    } = siteConfigs;

    if (active) {
      if (this.preHook) {
        await this.preHook(domain);
      }
      this.loadHelper({
        maxRequest, waitSecs, domain, path, pageNumber: 1,
      });
    } else {
      debug('etl disabled');
    }
  }
}

module.exports = RealState;

const debug = require('debug')('app:main');
const mapSeries = require('async/mapSeries');
const cron = require('node-cron');

const realState = require('./sites/realState');
const instagramTijuana = require('./sites/instagram/tijuana');
const config = require('./config');

function getRealStateSites() {
  const sites = config.get('sites');

  return Object.keys(sites).reduce((accu, source) => {
    if (sites[source].active) {
      Object.keys(sites[source].path).forEach((city) => {
        accu.push({ city, source });
      });
    }

    return accu;
  }, []);
}

function main() {
  const sites = getRealStateSites();

  cron.schedule('6 * * * *', async () => {
    debug('instagram');
    await instagramTijuana();
  });

  cron.schedule('42 * * * *', async () => {
    debug('realstate');
    mapSeries(sites, realState);
  });
}

main();

const debug = require('debug')('app:main');
const mapSeries = require('async/mapSeries');
const cron = require('node-cron');

const realState = require('./sites/realState');
const { getRealStateSites } = require('./sites/realState');
const instagramTijuana = require('./sites/instagram/tijuana');


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

const debug = require('debug')('app:main');
const mapSeries = require('async/mapSeries');
const cron = require('node-cron');

const realState = require('./sites/realState');
const { getRealStateSites } = require('./sites/realState');
const instagramTijuana = require('./sites/instagram/tijuana');
const etlPost = require('./sites/instagram/etlPost');


function main() {
  const sites = getRealStateSites();

  cron.schedule('6 * * * *', async () => {
    debug('instagram:instagramTijuana');
    await instagramTijuana();
  });
  cron.schedule('* */2 * * *', async () => {
    debug('instagram:etlPost');
    await etlPost();
  });

  cron.schedule('42 * * * *', async () => {
    debug('realstate');
    mapSeries(sites, realState);
  });
}

main();

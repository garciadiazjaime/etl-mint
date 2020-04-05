const mapSeries = require('async/mapSeries');
const cron = require('node-cron');

const realState = require('./sites/realState');
const { getRealStateSites } = require('./sites/realState');
const instagramTijuana = require('./sites/instagram/tijuana');
const etlPost = require('./sites/instagram/etlPost');


function main() {
  const sites = getRealStateSites();

  cron.schedule('6 */2 * * *', async () => {
    await instagramTijuana();
  });
  cron.schedule('*/15 * * * *', async () => {
    await etlPost();
  });

  cron.schedule('42 */4 * * *', async () => {
    await mapSeries(sites, realState);
  });
}

main();

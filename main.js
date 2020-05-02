const mapSeries = require('async/mapSeries');
const cron = require('node-cron');

const realState = require('./sites/realState');
const { getRealStateSites } = require('./sites/realState');
const instagramPostWorker = require('./sites/instagram/worker-post');
const instagramLocationWorker = require('./sites/instagram/worker-location');
const instagramScheduler = require('./sites/instagram/scheduler');


function main() {
  const sites = getRealStateSites();

  cron.schedule('*/30 * * * *', async () => {
    await instagramPostWorker();
    await instagramLocationWorker();
  });
  cron.schedule('21 15-3/1 * * *', async () => {
    await instagramScheduler();
  });

  cron.schedule('42 */4 * * *', async () => {
    await mapSeries(sites, realState);
  });
}

main();

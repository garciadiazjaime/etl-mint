const mapSeries = require('async/mapSeries');
const cron = require('node-cron');

const realState = require('./sites/realState');
const { getRealStateSites } = require('./sites/realState');
const instagramWorker = require('./sites/instagram/worker');
const instagramScheduler = require('./sites/instagram/scheduler');


function main() {
  const sites = getRealStateSites();

  cron.schedule('*/30 * * * *', async () => {
    await instagramWorker();
  });
  cron.schedule('21 15-3/1 * * *', async () => {
    await instagramScheduler();
  });

  cron.schedule('42 */4 * * *', async () => {
    await mapSeries(sites, realState);
  });
}

main();

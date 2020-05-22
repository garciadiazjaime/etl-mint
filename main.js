const mapSeries = require('async/mapSeries');
const cron = require('node-cron');

const realState = require('./sites/realState');
const { getRealStateSites } = require('./sites/realState');
const instagramPostWorker = require('./sites/instagram/worker-post');
const instagramLocationWorker = require('./sites/instagram/worker-location');
const instagramScheduler = require('./sites/instagram/scheduler');
const gcTwitter = require('./sites/gcenter/twitter');


function main() {
  const sites = getRealStateSites();

  cron.schedule('*/30 * * * *', async () => {
    await instagramPostWorker();
    await instagramLocationWorker();
  });
  cron.schedule('13 17/1,0-5 * * *', async () => {
    await instagramScheduler();
  });

  cron.schedule('42 */4 * * *', async () => {
    await mapSeries(sites, realState);
  });

  cron.schedule('42 13 * * *', async () => {
    await gcTwitter();
  });
}

main();

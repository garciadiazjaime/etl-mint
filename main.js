const mapSeries = require('async/mapSeries');
const cron = require('node-cron');

const realState = require('./sites/realState');
const { getRealStateSites } = require('./sites/realState');

const instagramPostWorker = require('./sites/instagram/worker-post');
const instagramLocationWorker = require('./sites/instagram/worker-location');
const instagramScheduler = require('./sites/instagram/scheduler');
const workerLogin = require('./sites/instagram/worker-login');

const gcTwitter = require('./sites/gcenter/twitter');


async function instagramWorker() {
  const cookies = await workerLogin();

  await instagramPostWorker(cookies);
  await instagramLocationWorker(cookies);
}

function main() {
  const sites = getRealStateSites();

  cron.schedule('29 15/1,0-5 * * *', instagramWorker);

  cron.schedule('13 17/2,0-5 * * *', async () => {
    await instagramScheduler();
  });

  cron.schedule('42 */4 * * *', async () => {
    await mapSeries(sites, realState);
  });

  cron.schedule('42 13 * * *', async () => {
    await gcTwitter();
  });
}

if (process.argv[2]) {
  instagramWorker();
} else {
  main();
}

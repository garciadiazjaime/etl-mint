const mapSeries = require('async/mapSeries');
const cron = require('node-cron');

const realState = require('./sites/realState');
const { getRealStateSites } = require('./sites/realState');

const instagramPostWorker = require('./sites/instagram/worker/post');
const instagramLocationWorker = require('./sites/instagram/worker/location');
const instagramMetaWorker = require('./sites/instagram/worker/meta');
const instagramScheduler = require('./sites/instagram/scheduler');
const workerLogin = require('./sites/instagram/worker/login');
const instagramPostVerifyWorker = require('./sites/instagram/worker/post-verify');

const gcenterWorker = require('./sites/gcenter/worker-ports');
const gcTwitter = require('./sites/gcenter/twitter');
const gcTwitterImage = require('./sites/gcenter/image');
const gcFacebook = require('./sites/gcenter/facebook');


async function instagramWorker() {
  const cookies = await workerLogin();

  await instagramPostWorker(cookies);
  await instagramLocationWorker(cookies);
}

function main() {
  const sites = getRealStateSites();
  cron.schedule('42 */4 * * *', async () => {
    await mapSeries(sites, realState);
    await instagramPostVerifyWorker();
  });

  cron.schedule('29 17-23,0-4 * * *', instagramWorker);

  cron.schedule('13 18-23/2 * * *', async () => {
    await instagramScheduler();
  });

  cron.schedule('49 5 * * *', async () => {
    await instagramMetaWorker();
  });

  cron.schedule('42 13 * * *', async () => {
    await gcTwitterImage();
  });

  cron.schedule('42 15 * * *', async () => {
    await gcTwitter.postImage();
    await gcFacebook();
  });

  cron.schedule('*/30 * * * *', async () => {
    await gcenterWorker();
  });
}

if (process.argv[2]) {
  instagramWorker();
} else {
  main();
}

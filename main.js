const mapSeries = require('async/mapSeries');
const cron = require('node-cron');

const realState = require('./sites/realState');
const { getRealStateSites } = require('./sites/realState');

const instagramPostWorker = require('./sites/instagram/worker/post');
const instagramLocationWorker = require('./sites/instagram/worker/location');
const instagramMetaWorker = require('./sites/instagram/worker/meta');
const instagramPostWithoutLocation = require('./sites/instagram/worker/post-without-location');
const instagramPostWithoutPhone = require('./sites/instagram/worker/post-without-phone');
const instagramScheduler = require('./sites/instagram/scheduler');
const workerLogin = require('./sites/instagram/worker/login');
const instagramPostVerifyWorker = require('./sites/instagram/worker/post-verify');
const instagramPostUpdateImageWorker = require('./sites/instagram/worker/post-update-image');

const gcenterWorker = require('./sites/gcenter/worker-ports');
const gcGenerateImage = require('./sites/gcenter/image');
const gcTwitter = require('./sites/gcenter/twitter');
const gcFacebook = require('./sites/gcenter/facebook');


async function instagramWorker() {
  const cookies = await workerLogin();

  await instagramPostWorker(cookies);
  await instagramLocationWorker(cookies);
  await instagramPostVerifyWorker(cookies);
  await instagramPostUpdateImageWorker(cookies);
}

function main() {
  const sites = getRealStateSites();
  cron.schedule('42 */4 * * *', async () => {
    await mapSeries(sites, realState);
  });

  cron.schedule('17 0-6,16-23 * * *', instagramWorker);

  cron.schedule('13 18-23/2 * * *', async () => {
    await instagramScheduler();
  });

  cron.schedule('49 5 * * *', async () => {
    await instagramPostWithoutLocation();
    await instagramPostWithoutPhone();
    await instagramMetaWorker();
  });

  cron.schedule('42 13 * * *', async () => {
    await gcGenerateImage();
  });

  cron.schedule('42 15 * * *', async () => {
    await gcTwitter.postImage();
    await gcFacebook.postImage();
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

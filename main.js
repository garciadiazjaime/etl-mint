const mapSeries = require('async/mapSeries');
const cron = require('node-cron');

const realState = require('./sites/realState');
const { getRealStateSites } = require('./sites/realState');

const instagramPostFromAPIWorker = require('./sites/instagram/worker/post-from-api');
const instagramPostFromETLWorker = require('./sites/instagram/worker/post-from-etl');
const instagramMetaWorker = require('./sites/instagram/worker/meta');
const instagramPostWithoutLocation = require('./sites/instagram/worker/post-without-location');
const instagramPostWithoutPhone = require('./sites/instagram/worker/post-without-phone');
const instagramScheduler = require('./sites/instagram/scheduler');
const workerLogin = require('./sites/instagram/worker/login');
const instagramPostVerifyWorker = require('./sites/instagram/worker/post-verify');
const instagramPostUpdateImageFromETLWorker = require('./sites/instagram/worker/post-update-image-from-etl');

const gcenterWorker = require('./sites/gcenter/worker-ports');
const gcGenerateImage = require('./sites/gcenter/image');
const gcTwitter = require('./sites/gcenter/twitter');
const gcFacebook = require('./sites/gcenter/facebook');


async function instagramWorker() {
  const cookies = await workerLogin();
  await instagramPostFromAPIWorker();
  await instagramPostFromETLWorker(cookies);
  await instagramPostUpdateImageFromETLWorker(cookies);

  // await instagramPostVerifyWorker(cookies);
}

function main() {
  const sites = getRealStateSites();
  cron.schedule('42 */12 * * *', async () => {
    await mapSeries(sites, realState);
  });

  cron.schedule('17 */8 * * *', async () => {
    await instagramPostFromAPIWorker();
  });

  cron.schedule('17 */4 * * *', async () => {
    const cookies = await workerLogin();

    await instagramPostFromETLWorker(cookies);
    await instagramPostUpdateImageFromETLWorker(cookies);
  });

  // cron.schedule('13 18-23/2 * * *', async () => {
  //   await instagramScheduler();
  // });

  // cron.schedule('49 5 * * *', async () => {
  //   await instagramPostWithoutLocation();
  //   await instagramPostWithoutPhone();
  //   await instagramMetaWorker();
  // });

  // cron.schedule('42 13 * * *', async () => {
  //   await gcGenerateImage();
  // });

  // cron.schedule('42 15 * * *', async () => {
  //   await gcTwitter.postImage();
  //   await gcFacebook.postImage();
  // });

  // cron.schedule('*/30 * * * *', async () => {
  //   await gcenterWorker();
  // });
}

if (process.argv[2]) {
  instagramWorker().then(() => {
    process.exit(1);
  });
} else {
  main();
}

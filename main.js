const mapSeries = require('async/mapSeries');
const cron = require('node-cron');
const debug = require('debug')('app:main');

const realState = require('./sites/realState');
const { getRealStateSites } = require('./sites/realState');

const instagramScheduler = require('./sites/instagram/scheduler');
const workerLogin = require('./sites/instagram/worker/login');
const likeInstagramPostWorker = require('./sites/instagram/worker/like-post');

const gcenterWorker = require('./sites/gcenter/worker-ports');
const gcGenerateImage = require('./sites/gcenter/image');
const gcTwitter = require('./sites/gcenter/twitter');
const gcFacebook = require('./sites/gcenter/facebook');
const netlify = require('./sites/netlify');


async function main() {
  const cookies = await workerLogin();

  const sites = getRealStateSites();
  cron.schedule('42 */12 * * *', async () => {
    await mapSeries(sites, realState);
  });

  cron.schedule('19 * * * *', async () => {
    await likeInstagramPostWorker(cookies);
  });

  cron.schedule('13 23 * * *', async () => {
    await instagramScheduler();
    await netlify();
  });

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

main().then(() => {
  debug('end');
});

const mapSeries = require('async/mapSeries');
const cron = require('node-cron');
const debug = require('debug')('app:main');

const realState = require('./sites/realState');
const { getRealStateSites } = require('./sites/realState');

const instagramPostFromAPIWorker = require('./sites/instagram/worker/post-from-api');
const getLatestPostsFromHashtag = require('./sites/instagram/worker/get-latest-posts-from-hashtag');
const instagramPostFromETLWorker = require('./sites/instagram/worker/post-from-etl');
const instagramPostWithoutLocation = require('./sites/instagram/worker/post-without-location');
const instagramPostWithoutPhone = require('./sites/instagram/worker/post-without-phone');
const instagramScheduler = require('./sites/instagram/scheduler');
const workerLogin = require('./sites/instagram/worker/login');
const instagramPostVerifyWorker = require('./sites/instagram/worker/post-verify');
const instagramUpdateImage = require('./sites/instagram/worker/update-image');
const likeInstagramPostWorker = require('./sites/instagram/worker/like-post');

const gcenterWorker = require('./sites/gcenter/worker-ports');
const gcGenerateImage = require('./sites/gcenter/image');
const gcTwitter = require('./sites/gcenter/twitter');
const gcFacebook = require('./sites/gcenter/facebook');
const netlify = require('./sites/netlify');


async function instagramWorker() {
  const cookies = await workerLogin();

  await getLatestPostsFromHashtag(cookies);

  // await instagramPostFromAPIWorker();
  // await instagramPostFromETLWorker(cookies);
  // await instagramUpdateImage(cookies);

  // await likeInstagramPostWorker(cookies);

  // await instagramPostVerifyWorker(cookies);
}

async function main() {
  const cookies = await workerLogin();

  const sites = getRealStateSites();
  cron.schedule('42 */12 * * *', async () => {
    await mapSeries(sites, realState);
  });

  // cron.schedule('17 */8 * * *', async () => {
  //   await instagramPostFromAPIWorker();
  // });

  cron.schedule('17 */4 * * *', async () => {
    await getLatestPostsFromHashtag(cookies);
    await instagramPostFromETLWorker(cookies);
    // await instagramUpdateImage(cookies);
  });

  cron.schedule('19 * * * *', async () => {
    await likeInstagramPostWorker(cookies);
  });

  cron.schedule('13 23 * * *', async () => {
    await instagramScheduler();
    await instagramUpdateImage(cookies);
    await netlify();
  });

  // cron.schedule('49 5 * * *', async () => {
  //   await instagramPostWithoutLocation();
  //   await instagramPostWithoutPhone();
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
    process.exit(0);
  });
} else {
  main().then(() => {
    debug('end');
  });
}

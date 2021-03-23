const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs');

const mapSeries = require('async/mapSeries');
const cron = require('node-cron');
const debug = require('debug')('app:main');

const realState = require('./sites/realState');
const { getRealStateSites } = require('./sites/realState');

const instagramPublishPost = require('./sites/instagram/publish-post');
const instagramLogin = require('./sites/instagram/login');
const instagramLikeCommentFollow = require('./sites/instagram/like-comment-follow');
const instagramFollowUpdate = require('./sites/instagram/follow');

const gcenterWorker = require('./sites/gcenter/worker-ports');
const gcGenerateImage = require('./sites/gcenter/image');
const gcTwitter = require('./sites/gcenter/twitter');
const gcFacebook = require('./sites/gcenter/facebook');
const netlify = require('./sites/netlify');

const { openDB } = require('./utils/database');
const config = require('./config');

const PORT = config.get('port');

const isProduction = config.get('env') === 'production';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('combined'));

app.use(express.static('public'));

app.get('/', (req, res) => res.json({ msg: ':)' }));

function setupCron(cookies) {
  if (!isProduction) {
    return debug('CRON_NOT_SETUP');
  }

  const sites = getRealStateSites();
  cron.schedule('42 */12 * * *', async () => {
    await mapSeries(sites, realState);
  });

  cron.schedule('19 * * * *', async () => {
    await instagramLikeCommentFollow(cookies);
  });

  cron.schedule('27 */12 * * *', async () => {
    await instagramFollowUpdate();
  });

  cron.schedule('13 23 * * *', async () => {
    await instagramPublishPost();

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

  return debug('CRON_SETUP');
}

function getLocalCookies() {
  // const cookies = await instagramLogin();
  // fs.writeFileSync('./cookies.json', JSON.stringify(cookies));
  const cookies = require('./cookies.json');

  return cookies;
}

app.listen(PORT, async () => {
  debug(`Listening on ${PORT}`);

  await openDB();
  debug('DB opened');

  const cookies = isProduction ? await instagramLogin() : getLocalCookies();

  // await instagramLikeCommentFollow(cookies);

  // await instagramPublishPost();

  await instagramFollowUpdate();

  setupCron(cookies);
});

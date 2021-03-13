const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const mapSeries = require('async/mapSeries');
const cron = require('node-cron');
const debug = require('debug')('app:main');

const realState = require('./sites/realState');
const { getRealStateSites } = require('./sites/realState');

const instagramPublishPost = require('./sites/instagram/publish-post');
const instagramLogin = require('./sites/instagram/login');
const instagramLikePost = require('./sites/instagram/like-post');

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

app.get('/like', (req, res) => res.json({ msg: ':)' }));

function setupCron(cookies) {
  if (!isProduction) {
    return debug('CRON_NOT_SETUP');
  }

  const sites = getRealStateSites();
  cron.schedule('42 */12 * * *', async () => {
    await mapSeries(sites, realState);
  });

  cron.schedule('19 * * * *', async () => {
    await instagramLikePost(cookies);
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

app.listen(PORT, async () => {
  debug(`Listening on ${PORT}`);

  await openDB();
  debug('DB opened');

  const cookies = isProduction ? await instagramLogin() : null;
  // const cookies = await instagramLogin();

  // await instagramLikePost(cookies);

  // await instagramPublishPost();

  setupCron(cookies);
});

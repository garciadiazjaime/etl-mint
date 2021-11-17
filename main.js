const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs');
const request = require('request');
const fetch = require('node-fetch');

const mapSeries = require('async/mapSeries');
const cron = require('node-cron');
const debug = require('debug')('app:main');

const realState = require('./sites/realState');
const { getRealStateSites } = require('./sites/realState');

const instagramPublishPost = require('./sites/instagram/publish-post');
const instagramLogin = require('./sites/instagram/login');
const commentPost = require('./sites/instagram/comment-post');
const followUsers = require('./sites/instagram/follow-users');

const gcenterWorker = require('./sites/gcenter/worker-ports');
const gcGenerateImage = require('./sites/gcenter/image');
const gcTwitter = require('./sites/gcenter/twitter');
const gcFacebook = require('./sites/gcenter/facebook');
const netlify = require('./sites/netlify');

const { openDB } = require('./utils/database');
const config = require('./config');

const APP_URL = config.get('app.url');

const PORT = config.get('port');

const isProduction = config.get('env') === 'production';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('combined'));

app.use(express.static('public'));

app.get('/', (req, res) => res.json({ msg: ':)' }));

app.get('/proxy', (req, res) => {
  const { url } = req.query;
  if (!url) {
    return debug('EMPTY_URL');
  }

  debug(url);
  request.get(url).pipe(res);
});

function setupCron(cookies) {
  if (!isProduction) {
    return debug('CRON_NOT_SETUP');
  }

  // const sites = getRealStateSites();
  // cron.schedule('42 */12 * * *', async () => {
  //   await mapSeries(sites, realState);
  // });

  // cron.schedule('19 */4 * * *', async () => {
  //   await commentPost(cookies);
  // });

  // cron.schedule('17 */3 * * *', async () => {
  //   await followUsers(cookies);
  // });

  // cron.schedule('13 24 * * *', async () => {
  //   await instagramPublishPost();

  //   await netlify();
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

  cron.schedule('*/10 * * * *', async () => {
    await fetch(APP_URL);
  });

  return debug('CRON_SETUP');
}

async function getLocalCookies() {
  // const cookies = await instagramLogin();
  // fs.writeFileSync('./cookies.json', JSON.stringify(cookies));
  const cookies = require('./cookies.json');

  return cookies;
}

const path = './public';
app.listen(PORT, async () => {
  debug(`Listening on ${PORT}`);

  await openDB();
  debug('DB opened');

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }

  // await instagramPublishPost();

  const cookies = {}; // isProduction ? await instagramLogin() : await getLocalCookies();

  // await commentPost(cookies);

  // await followUsers(cookies);

  await fetch(APP_URL);

  setupCron(cookies);
});

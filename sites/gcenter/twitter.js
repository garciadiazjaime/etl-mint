const fs = require('fs');

const mapSeries = require('async/mapSeries');
const Twitter = require('twitter-lite');
const debug = require('debug')('app:gc:tw');


const { getPublications } = require('../../utils/gcenter-api');
const { waiter } = require('../../utils/fetch');
const { getPostMessage } = require('./util');
const config = require('../../config');

function getClient(subdomain = 'api') {
  return new Twitter({
    subdomain,
    consumer_key: config.get('gcenter.twitter.key'),
    consumer_secret: config.get('gcenter.twitter.secret'),
    access_token_key: config.get('gcenter.twitter.tokenKey'),
    access_token_secret: config.get('gcenter.twitter.tokenSecret'),
  });
}


async function postStatus() {
  debug('start');

  const tweets = await getPublications();

  if (!Array.isArray(tweets) || !tweets.length) {
    return null;
  }

  const client = getClient();

  await client.get('account/verify_credentials');

  return mapSeries(tweets, async (status) => {
    await client.post('statuses/update', { status });
    debug('posted', !!status);
    await waiter();
  });
}

async function postReportImage(mediaID) {
  const client = getClient();

  await client.get('account/verify_credentials');

  const status = getPostMessage();

  await client.post('statuses/update', { status, media_ids: mediaID });

  debug('image published');
}

async function postImage() {
  const filename = './data/output.png';

  const base64Image = fs.readFileSync(filename, { encoding: 'base64' });

  const client = getClient('upload');

  debug('image loaded');

  const mediaUploadResponse = await client.post('media/upload', {
    media_data: base64Image,
  });

  await postReportImage(mediaUploadResponse.media_id_string);
}

if (require.main === module) {
  // postStatus();

  postImage();
}

module.exports = {
  postStatus,
  postImage,
};

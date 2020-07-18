const fs = require('fs');
const { FB } = require('fb');
const mapSeries = require('async/mapSeries');
const debug = require('debug')('app:gc:fb');

const { getPublications } = require('../../utils/gcenter-api');
const { waiter } = require('../../utils/fetch');
const { getPostMessage } = require('./util');
const config = require('../../config');

const token = config.get('gcenter.facebook.token');
FB.setAccessToken(token);

async function postStatus() {
  const posts = await getPublications();

  return mapSeries(posts, async (message) => {
    await waiter();

    return new Promise((resolve) => {
      FB.api('me/feed', 'post', { message }, (res) => {
        if (!res || res.error) {
          debug(!res ? 'error occurred' : res.error);
        }
        debug('posted', !!res);

        resolve();
      });
    });
  });
}

async function postImage() {
  const filename = './data/output.png';
  const caption = getPostMessage();

  return new Promise((resolve) => {
    FB.api('me/photos', 'post', { source: fs.createReadStream(filename), caption }, (res) => {
      if (!res || res.error) {
        debug(!res ? 'error occurred' : res.error);
        return;
      }
      debug('posted', !!res);
      resolve();
    });
  });
}

if (require.main === module) {
  // postStatus();

  postImage();
}

module.exports = {
  postStatus,
  postImage,
};

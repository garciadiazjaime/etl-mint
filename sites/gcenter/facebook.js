const { FB } = require('fb');
const mapSeries = require('async/mapSeries');
const debug = require('debug')('app:facebook');

const { getPublications } = require('../../utils/gcenter-api');
const { waiter } = require('../../utils/fetch');
const config = require('../../config');

const token = config.get('gcenter.facebook.token');

FB.setAccessToken(token);

async function main() {
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

if (require.main === module) {
  main()
    .then(() => {
      process.exit(1);
    });
}

module.exports = main;

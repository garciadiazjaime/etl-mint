const mapSeries = require('async/mapSeries');
const Twitter = require('twitter-lite');
const debug = require('debug')('app:twitter');

const { getPublications } = require('../../utils/gcenter-api');
const { waiter } = require('../../utils/fetch');
const config = require('../../config');

const client = new Twitter({
  consumer_key: config.get('gcenter.twitter.key'),
  consumer_secret: config.get('gcenter.twitter.secret'),
  access_token_key: config.get('gcenter.twitter.tokenKey'),
  access_token_secret: config.get('gcenter.twitter.tokenSecret'),
});


async function main() {
  debug('start');

  const tweets = await getPublications();

  if (!Array.isArray(tweets) || !tweets.length) {
    return null;
  }

  await client.get('account/verify_credentials');

  return mapSeries(tweets, async (status) => {
    await client.post('statuses/update', { status });
    debug('posted', !!status);
    await waiter();
  });
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

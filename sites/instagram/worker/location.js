const debug = require('debug')('app:instagram:worker:location');
const mapSeries = require('async/mapSeries');

const locationProcessor = require('../processor/location');
const { getPosts } = require('../../../utils/mint-api');
const { getPostsWithLocationRaw } = require('../queries-mint-api');

async function main(cookies) {
  const posts = await getPosts(getPostsWithLocationRaw());

  debug(posts.length);

  if (!posts.length) {
    return null;
  }

  await mapSeries(posts, async (post) => {
    await locationProcessor(post, cookies);
  });

  return debug('updated');
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

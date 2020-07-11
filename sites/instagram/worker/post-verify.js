const debug = require('debug')('app:instagram:worker:expire');
const mapSeries = require('async/mapSeries');

const processor = require('../processor/post-verify');
const { getPosts } = require('../../../utils/mint-api');
const { getPostToVerify } = require('../queries-mint-api');

async function main() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const query = getPostToVerify(yesterday.toJSON());
  const posts = await getPosts(query);

  debug(posts.length);

  if (!posts.length) {
    return null;
  }

  await mapSeries(posts, processor);

  return debug('updated');
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

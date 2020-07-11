const debug = require('debug')('app:instagram:worker:meta');
const mapSeries = require('async/mapSeries');

const processor = require('../processor/meta');
const { getPosts } = require('../../../utils/mint-api');
const { getPostsMeta } = require('../queries-mint-api');

async function main() {
  const posts = await getPosts(getPostsMeta());

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

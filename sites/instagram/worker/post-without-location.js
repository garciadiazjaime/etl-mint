const debug = require('debug')('app:instagram:worker:post-without-location');
const mapSeries = require('async/mapSeries');

const processor = require('../processor/post-without-location');
const { getPosts } = require('../../../utils/mint-api');
const { getPostWithoutLocation } = require('../queries-mint-api');
const { getCounter } = require('../../../utils/counter');

async function main() {
  const query = getPostWithoutLocation(1);
  const posts = await getPosts(query);

  if (!posts.length) {
    debug('no-posts');
    return null;
  }

  const counter = getCounter()();

  await mapSeries(posts, async (post) => {
    await processor(post, counter);
  });

  return debug(`locations: ${counter.count()} / ${posts.length}`);
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

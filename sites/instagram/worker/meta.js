const debug = require('debug')('app:instagram:worker:meta');
const mapSeries = require('async/mapSeries');

const processor = require('../processor/meta');
const { getPosts } = require('../../../utils/mint-api');
const { getCounter } = require('../../../utils/counter');
const { getPostsMeta } = require('../queries-mint-api');

const counterGenerator = getCounter();

async function main() {
  const posts = await getPosts(getPostsMeta());

  const counter = counterGenerator();

  await mapSeries(posts, async (post) => {
    await processor(post, counter);
  });

  return debug(`${counter.count()} / ${posts.length}`);
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

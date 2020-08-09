const debug = require('debug')('app:instagram:worker:location');
const mapSeries = require('async/mapSeries');

const locationProcessor = require('../processor/location');
const { getPosts } = require('../../../utils/mint-api');
const { getCounter } = require('../../../utils/counter');
const { getPostsWithLocationRaw } = require('../queries-mint-api');

const counterGenerator = getCounter();

async function main(cookies) {
  const posts = await getPosts(getPostsWithLocationRaw());

  const counter = counterGenerator();

  await mapSeries(posts, async (post) => {
    await locationProcessor(post, cookies, counter);
  });

  return debug(`${counter.count()} / ${posts.length}`);
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

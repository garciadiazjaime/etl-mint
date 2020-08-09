const debug = require('debug')('app:instagram:worker:post-without-phone');
const mapSeries = require('async/mapSeries');

const processor = require('../processor/post-without-phone');
const { getPosts } = require('../../../utils/mint-api');
const { getPostsWithoutPhones } = require('../queries-mint-api');
const { getCounter } = require('../../../utils/counter');

const counterGenerator = getCounter();

async function main() {
  const query = getPostsWithoutPhones();
  const posts = await getPosts(query);

  if (!posts.length) {
    debug('no-posts');
    return null;
  }

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

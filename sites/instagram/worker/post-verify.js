const debug = require('debug')('app:instagram:worker:verify');
const mapSeries = require('async/mapSeries');

const processor = require('../processor/post-verify');
const { getPosts } = require('../../../utils/mint-api');
const { getCounter } = require('../../../utils/counter');
const { getPostToVerify } = require('../queries-mint-api');

const counterGenerator = getCounter();

async function main(cookies) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const query = getPostToVerify(yesterday.toJSON());
  const posts = await getPosts(query);

  debug(posts.length);

  if (!posts.length) {
    return null;
  }

  const counter = counterGenerator();

  await mapSeries(posts, async (post) => {
    await processor(post, cookies, counter);
  });

  return debug(`${counter.count()} / ${posts.length}`);
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

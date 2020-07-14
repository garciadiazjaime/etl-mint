const debug = require('debug')('app:instagram:worker:update-image');
const mapSeries = require('async/mapSeries');

const processor = require('../processor/post-update-image');
const { getPosts } = require('../../../utils/mint-api');
const { getPostToUpdateMedia } = require('../queries-mint-api');

async function main(cookies) {
  const oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - 28);

  const query = getPostToUpdateMedia(oldDate.toJSON(), 100);

  const posts = await getPosts(query);

  debug(posts.length);

  if (!posts.length) {
    return null;
  }

  await mapSeries(posts, async (post) => {
    await processor(post, cookies);
  });

  return debug('updated');
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

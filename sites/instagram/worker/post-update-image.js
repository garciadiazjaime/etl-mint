const debug = require('debug')('app:instagram:worker:update-image');
const mapSeries = require('async/mapSeries');

const processor = require('../processor/post-update-image');
const { getPosts } = require('../../../utils/mint-api');
const { getPostToUpdateMedia } = require('../queries-mint-api');

async function main() {
  const oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - 14);

  const query = getPostToUpdateMedia(oldDate.toJSON());

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
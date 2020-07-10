const mapSeries = require('async/mapSeries');

const locationProcessor = require('../processor/location');
const { getPosts } = require('../../../utils/mint-api');
const { getPostsWithLocationRaw } = require('../queries');

async function main(cookies) {
  const posts = await getPosts(getPostsWithLocationRaw());
  if (posts.length) {
    await mapSeries(posts, async (post) => {
      await locationProcessor(post, cookies);
    });
  }
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

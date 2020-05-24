const mapSeries = require('async/mapSeries');

const locationProcessor = require('./location-processor');
const { getPosts } = require('../../utils/mint-api');

async function main(cookies) {
  const posts = await getPosts({ locationState: 'RAW', limit: 20 });

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

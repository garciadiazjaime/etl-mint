const mapSeries = require('async/mapSeries');

const locationProcessor = require('./location-processor');
const { getPosts } = require('../../utils/mint-api');

async function main() {
  const posts = await getPosts({ locationState: 'RAW', limit: 20 });

  if (posts.length) {
    await mapSeries(posts, locationProcessor);
  }
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

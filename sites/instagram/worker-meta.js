const debug = require('debug')('app:instagram:worker:meta');
const mapSeries = require('async/mapSeries');

const processor = require('./processor-meta');
const { getPosts } = require('../../utils/mint-api');

async function main() {
  const posts = await getPosts({ limit: 100 });

  if (!Array.isArray(posts) || !posts.length) {
    return null;
  }

  debug(posts.length);

  await mapSeries(posts, processor);

  return debug('updated');
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

const mapSeries = require('async/mapSeries');

const postProcessor = require('./post-processor');
const { getPosts } = require('./instagram-api');
const config = require('../../config');

const taskConfig = {
  env: config.get('env'),
  token: config.get('instagram.token'),
  hashtag: config.get('instagram.hashtag'),
  userId: config.get('instagram.userId'),
  apiUrl: config.get('api.url'),
};

async function main() {
  const posts = await getPosts(taskConfig);

  await mapSeries(posts, postProcessor);
}

if (require.main === module) {
  main();
}

module.exports = main;

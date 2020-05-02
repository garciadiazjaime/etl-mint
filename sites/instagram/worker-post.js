const mapSeries = require('async/mapSeries');

const postProcessor = require('./post-processor');
const { getInstagramPosts } = require('./instagram-api');
const config = require('../../config');

const taskConfig = {
  env: config.get('env'),
  token: config.get('instagram.token'),
  hashtag: config.get('instagram.hashtag'),
  userId: config.get('instagram.userId'),
  apiUrl: config.get('api.url'),
};

async function main() {
  const posts = [];
  const hashtags = taskConfig.hashtag.split(',');

  await mapSeries(hashtags, async (hashtag) => {
    const response = await getInstagramPosts(taskConfig, hashtag);

    if (Array.isArray(response) && response.length) {
      posts.push(...response);
    }
  });

  if (posts.length) {
    await mapSeries(posts, postProcessor);
  }
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

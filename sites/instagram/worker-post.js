const mapSeries = require('async/mapSeries');

const workerLogin = require('./worker-login');
const postProcessor = require('./post-processor');
const { getInstagramPosts } = require('./instagram-api');
const { waiter } = require('../../utils/fetch');
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

  const cookies = await workerLogin();

  await mapSeries(hashtags, async (hashtag) => {
    const instagramPosts = await getInstagramPosts(taskConfig, hashtag);

    if (Array.isArray(instagramPosts) && instagramPosts.length) {
      posts.push(...instagramPosts);
    }

    await waiter();
  });

  if (posts.length) {
    await mapSeries(posts, post => postProcessor(post, cookies));
  }
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

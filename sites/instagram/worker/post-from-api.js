const debug = require('debug')('app:instagram:worker:post');
const mapSeries = require('async/mapSeries');

const { updateInstagramPost } = require('../../../utils/mint-api');

const { getInstagramPosts } = require('../instagram-api');
const { waiter } = require('../../../utils/fetch');
const config = require('../../../config');

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
    const instagramPosts = await getInstagramPosts(taskConfig, hashtag);

    if (Array.isArray(instagramPosts) && instagramPosts.length) {
      posts.push(...instagramPosts);
    }

    await waiter();
  });

  await mapSeries(posts, async (post) => {
    await updateInstagramPost(post);
  });

  return debug(`${posts.length}`);
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

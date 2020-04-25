const Queue = require('bull');
const debug = require('debug')('app:instagram:wrk');

const config = require('../../config');
const { getPosts } = require('./instagram-api');

const taskConfig = {
  env: config.get('env'),
  token: config.get('instagram.token'),
  hashtag: config.get('instagram.hashtag'),
  userId: config.get('instagram.userId'),
  apiUrl: config.get('api.url'),
  redisUr: config.get('redis.url'),
};

const instagramQueue = new Queue('instagram', taskConfig.redisUr);
const postQueue = new Queue('instagram:post', taskConfig.redisUr);

instagramQueue.process(async () => {
  const posts = await getPosts(taskConfig);

  posts.forEach(item => postQueue.add(item));

  return Promise.resolve();
});
instagramQueue.on('completed', () => {
  debug('instagramQueue:completed');
});
instagramQueue.on('error', (error) => {
  debug('postQueue:error', error);
});
instagramQueue.on('failed', (job, error) => {
  debug('postQueue:failed', error);
});

instagramQueue.add({}, { repeat: { cron: '*/2 * * * *' } });

postQueue.process(`${__dirname}/post-processor`);
postQueue.on('completed', (job, result) => {
  debug('saved', result.id);
});
postQueue.on('error', (error) => {
  debug('postQueue:error', error);
});
postQueue.on('failed', (job, error) => {
  debug('postQueue:failed', error);
});

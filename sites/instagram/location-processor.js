const debug = require('debug')('app:instagram:pro:loc');

const { getGeoLocation } = require('./location-etl');
const { savePost } = require('../../utils/mint-api');

const config = require('../../config');

const secondsToWait = 1000 * (config.get('env') === 'production' ? 10 : 1);

async function waiter() {
  return new Promise((resolve) => {
    setInterval(() => {
      resolve();
    }, secondsToWait);
  });
}

async function processor(post) {
  await waiter();
  if (post.location && post.location.state && post.location.state !== 'RAW') {
    return debug(`already saved, post: ${post.id}`);
  }

  const geoLocation = await getGeoLocation(post.location);

  const data = {
    ...post,
    location: {
      ...post.location,
      ...geoLocation,
      state: 'MAPPED',
    },
  };

  const response = await savePost(data);
  return debug(`saved, post:${response && response.id}`);
}

module.exports = processor;

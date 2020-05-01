const debug = require('debug')('app:instagram:proc');

const { getUser } = require('./user-etl');
const { getGeoLocation } = require('./location-etl');
const { getMeta } = require('./meta');
const { savePost, getPosts } = require('../../utils/mint-api');

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

  const apiResponse = await getPosts();

  if (Array.isArray(apiResponse) && apiResponse.length) {
    return debug(`already saved: ${post.id}`);
  }

  const { user, location } = await getUser(post);

  if (!user) {
    return null;
  }

  const geoLocation = await getGeoLocation(location);

  const meta = getMeta(post, location);

  const data = {
    ...post,
    user,
    location: {
      ...location,
      ...geoLocation,
    },
    meta,
    state: 'MAPPED',
    published: false,
  };

  debug(`user:${!!user}, location:${!!location}, geoLocation:${!!geoLocation}`);
  const response = await savePost(data);
  debug(`saved:${response && response.id}`);

  return response;
}

module.exports = processor;

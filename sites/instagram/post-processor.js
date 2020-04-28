const debug = require('debug')('app:instagram:proc');

const { getUser } = require('./user-etl');
const { getGeoLocation } = require('./location-etl');
const { getMeta } = require('./meta');
const { savePost } = require('../../utils/mint-api');

async function waiter() {
  return new Promise((resolve) => {
    setInterval(() => {
      resolve();
    }, 10 * 1000);
  });
}

async function processor(post) {
  await waiter();

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
  };

  debug(`user:${!!user}, location:${!!location}, geoLocation:${!!geoLocation}`);
  const response = await savePost(data);
  debug(`saved:${response && response.id}`);

  return response;
}

module.exports = processor;

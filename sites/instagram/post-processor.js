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

async function processor(job) {
  await waiter();

  const { data: post } = job;

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

  const response = await savePost(data);

  return response;
}

module.exports = processor;

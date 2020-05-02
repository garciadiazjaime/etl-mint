const debug = require('debug')('app:instagram:pro:loc');

const { getGeoLocation } = require('./location-etl');
const { savePost } = require('../../utils/mint-api');

async function processor(post) {
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
  return debug(`geoLocation:${!!geoLocation}, post:${response && response.id}`);
}

module.exports = processor;

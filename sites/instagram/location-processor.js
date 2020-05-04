const debug = require('debug')('app:instagram:pro:loc');

const { getGeoLocation } = require('./location-etl');
const { savePost, getLocation } = require('../../utils/mint-api');

async function getNewLocation(post) {
  const { location } = post;

  if (location.id) {
    const apiResponse = await getLocation({ id: location.id, state: 'MAPPED' });

    if (Array.isArray(apiResponse) && apiResponse.length) {
      debug(`location mapped found: ${apiResponse[0].id}, post: ${post.id}`);
      return apiResponse[0];
    }
  }

  const geoLocation = await getGeoLocation(location);
  debug(`geoLocation: ${!!geoLocation}, post: ${post.id}`);

  return {
    ...location,
    ...geoLocation,
    state: 'MAPPED',
  };
}

async function processor(post) {
  if (post.location && post.location.state && post.location.state === 'MAPPED') {
    return debug(`location already mapped, post: ${post.id}`);
  }


  const location = await getNewLocation(post);

  const data = {
    ...post,
    location,
  };

  await savePost(data);

  return debug(`saved, post:${post.id}`);
}

module.exports = processor;

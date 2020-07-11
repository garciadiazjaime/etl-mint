const debug = require('debug')('app:instagram:pro:loc');

const { getGeoLocation } = require('../location-etl');
const { createInstagramPost, getLocation } = require('../../../utils/mint-api');
const { getLocationsMappedByID } = require('../queries-mint-api');

async function getNewLocation(post, cookies) {
  const { location } = post;

  const query = getLocationsMappedByID(location.id);
  const apiResponse = await getLocation(query);

  if (Array.isArray(apiResponse) && apiResponse.length) {
    const locationApi = apiResponse[0];
    debug(`location mapped found: ${locationApi.id}/${locationApi.slug}, post: ${post.id}`);
    return locationApi;
  }

  const geoLocation = await getGeoLocation(location, cookies);
  debug(`geoLocation: ${!!geoLocation}, post: ${post.id}`);

  if (!location.location.type) {
    delete location.location;
  }

  if (!location.address) {
    delete location.address;
  }

  return {
    ...location,
    ...geoLocation,
    state: 'MAPPED',
  };
}

async function processor(post, cookies) {
  const location = await getNewLocation(post, cookies);

  const data = {
    ...post,
    location,
  };

  const response = await createInstagramPost(data);

  debug(`saved:${response && response.id}`);
}

module.exports = processor;

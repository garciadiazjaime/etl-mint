const debug = require('debug')('app:instagram:pro:loc');

const { getGeoLocation } = require('../location-etl');
const { createInstagramPost, createInstagramLocation, getLocation } = require('../../../utils/mint-api');
const { getLocationsMappedByID } = require('../queries-mint-api');

async function getNewLocation(post, cookies) {
  const { location } = post;

  const query = getLocationsMappedByID(location.id);

  const apiResponse = await getLocation(query);

  if (Array.isArray(apiResponse) && apiResponse.length) {
    const locationApi = apiResponse[0];
    debug(`location found: ${locationApi.id}`);
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

async function processor(post, cookies, counter) {
  const location = await getNewLocation(post, cookies);

  await createInstagramLocation(location);

  const data = {
    ...post,
    location,
  };

  const response = await createInstagramPost(data);

  if (!response || !response.id) {
    debug(response);
  } else {
    counter.increment();
  }
}

module.exports = processor;

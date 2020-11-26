const debug = require('debug')('app:instagram:pro:loc');

const { getGeoLocation } = require('../location-etl');
const { createInstagramPost, createInstagramLocation, getLocation } = require('../../../utils/mint-api');
const { getLocationsMappedByID } = require('../queries-mint-api');

const { getPost } = require('../post-etl');

async function getNewLocation(post, cookies, counter) {
  const { location } = post;

  const query = getLocationsMappedByID(location.id);

  const apiResponse = await getLocation(query);

  if (Array.isArray(apiResponse) && apiResponse.length) {
    const locationApi = apiResponse[0];
    return locationApi;
  }

  const geoLocation = await getGeoLocation(location, cookies);

  if (!location.location.type) {
    delete location.location;
  }

  if (!location.address) {
    delete location.address;
  }

  counter.increment();

  return {
    ...location,
    ...geoLocation,
    state: 'MAPPED',
  };
}

async function processor(post, cookies) {
  console.log('post', post);
  const responseETL = await getPost(post, cookies);
  console.log('responseETL', responseETL);


  // const location = await getNewLocation(post, cookies, counter);

  // await createInstagramLocation(location);

  // const data = {
  //   ...post,
  //   location,
  // };

  const newPost = {
    ...post,
    ...responseETL,
  };
  console.log('perro:newPost', newPost);
  // const responseAPI = await createInstagramPost();
  // console.log('responseAPI', responseAPI);

  // if (!response || !response.id) {
  //   debug(response);
  // }
}

module.exports = processor;

const debug = require('debug')('app:instagram:pro:post');

const { getUser } = require('../user-etl');
const { getMeta } = require('../meta');
const {
  createInstagramPost, createInstagramUser, createInstagramLocation, getPosts, getLocation,
} = require('../../../utils/mint-api');
const { getPostID, getLocationsMappedByID } = require('../queries-mint-api');

async function processor(instagramPost, cookies, counter) {
  const postApi = await getPosts(getPostID(instagramPost.id));

  if (Array.isArray(postApi) && postApi.length) {
    return null;
  }

  const { user, location } = await getUser(instagramPost, cookies);

  if (!user) {
    debug(`NO_USER: ${instagramPost.permalink}`);
    return null;
  }

  await createInstagramUser(user);

  const meta = getMeta(instagramPost, location);

  const post = {
    ...instagramPost,
    user,
    meta,
    state: 'MAPPED',
    published: false,
  };

  if (location) {
    const locationApi = await getLocation(getLocationsMappedByID(location.id));

    if (Array.isArray(locationApi) && locationApi.length) {
      post.location = {
        id: locationApi[0].id,
        name: locationApi[0].name,
        slug: locationApi[0].slug,
        state: locationApi[0].state,
      };
      if (locationApi[0].location && locationApi[0].location.type) {
        post.location.location = locationApi[0].location;
      }
      if (locationApi[0].address) {
        post.location.address = locationApi[0].address;
      }
    } else {
      post.location = {
        ...location,
        state: 'RAW',
      };
      await createInstagramLocation(post.location);
    }
  }

  const response = await createInstagramPost(post);

  if (!response || !response.id) {
    debug(response);
    debug(post);
  } else {
    counter.increment();
  }

  return response;
}

module.exports = processor;

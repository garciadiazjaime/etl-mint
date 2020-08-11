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
      debug(`location found: ${locationApi[0].id}`);
      post.location = { ...locationApi[0] };
    } else {
      post.location = {
        ...location,
        state: 'RAW',
      };
      const locationResponse = await createInstagramLocation(post.location);
      debug(`location: ${locationResponse.id}`);
    }
  }

  const response = await createInstagramPost(post);

  if (!response || !response.id) {
    debug(post);
  } else {
    counter.increment();
  }

  return response;
}

module.exports = processor;

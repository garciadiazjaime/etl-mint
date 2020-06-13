const debug = require('debug')('app:instagram:proc');

const { getUser } = require('./user-etl');
const { getMeta } = require('./meta');
const { savePost, getPosts, getLocation } = require('../../utils/mint-api');

async function processor(instagramPost, cookies) {
  const apiPost = await getPosts({ id: instagramPost.id });

  if (Array.isArray(apiPost) && apiPost.length) {
    return null;
  }

  const { user, location } = await getUser(instagramPost, cookies);

  if (!user) {
    debug(`NO_USER: ${instagramPost.permalink}`);
    return null;
  }

  const meta = getMeta(instagramPost, location);

  const post = {
    ...instagramPost,
    user,
    meta,
    state: 'MAPPED',
    published: false,
  };

  if (location) {
    const locationApi = await getLocation({ id: location.id, state: 'MAPPED' });

    if (Array.isArray(locationApi) && locationApi.length) {
      debug(`location mapped found: ${locationApi[0].id}, post: ${post.id}`);
      post.location = { ...locationApi[0] };
    } else {
      post.location = {
        ...location,
        state: 'RAW',
      };
    }
  }

  const response = await savePost(post);
  debug(`user:${!!user}, location:${!!location}, saved:${response && response.id}`);

  return response;
}

module.exports = processor;

const debug = require('debug')('app:instagram:proc');

const { getUser } = require('./user-etl');
const { getMeta } = require('./meta');
const { savePost, getPosts } = require('../../utils/mint-api');

async function processor(instagramPost) {
  const apiPost = await getPosts({ id: instagramPost.id });

  if (Array.isArray(apiPost) && apiPost.length) {
    return debug(`already saved: ${instagramPost.id}`);
  }

  const { user, location } = await getUser(instagramPost);

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
    post.location = {
      ...location,
      state: 'RAW',
    };
  }

  debug(`user:${!!user}, location:${!!location}`);
  const response = await savePost(post);
  debug(`saved:${response && response.id}`);

  return response;
}

module.exports = processor;

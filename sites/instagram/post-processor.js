const debug = require('debug')('app:instagram:proc');

const { getUser } = require('./user-etl');
const { getMeta } = require('./meta');
const { savePost, getPosts } = require('../../utils/mint-api');

async function processor(post) {
  const apiResponse = await getPosts({ id: post.id });

  if (Array.isArray(apiResponse) && apiResponse.length) {
    return debug(`already saved: ${post.id}`);
  }

  const { user, location } = await getUser(post);

  if (!user) {
    return null;
  }

  const meta = getMeta(post, location);

  const data = {
    ...post,
    user,
    location: {
      ...location,
      state: 'RAW',
    },
    meta,
    state: 'MAPPED',
    published: false,
  };

  debug(`user:${!!user}, location:${!!location}`);
  const response = await savePost(data);
  debug(`saved:${response && response.id}`);

  return response;
}

module.exports = processor;

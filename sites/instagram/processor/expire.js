const debug = require('debug')('app:instagram:proc:expire');

const { createInstagramPost } = require('../../../utils/mint-api');
const extract = require('../../../utils/extract');


async function processor(data, cookies) {
  const post = { ...data };

  debug(`extract:${post.permalink}`);
  const source = 'instagram-post-not-found';
  const html = await extract(post.permalink, source, cookies);

  if (!html.includes('Page Not Found')) {
    return null;
  }

  debug('deleted');
  post.state = 'DELETED';
  return createInstagramPost(post);
}

module.exports = processor;

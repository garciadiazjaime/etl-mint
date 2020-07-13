const debug = require('debug')('app:instagram:proc:verify');

const { createInstagramPost } = require('../../../utils/mint-api');
const { waiter } = require('../../../utils/fetch');
const extract = require('../../../utils/extract');


async function processor(data, cookies) {
  const post = {
    ...data,
    lastCheck: new Date().toJSON(),
  };

  await waiter();

  const source = 'instagram-post-not-found';
  const html = await extract(post.permalink, source, cookies);

  if (!html.includes('Page Not Found')) {
    return null;
  }

  debug(`deleted:${post.id}`);
  post.state = 'DELETED';
  return createInstagramPost(post);
}

module.exports = processor;

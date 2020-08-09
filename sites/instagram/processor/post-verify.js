const { createInstagramPost } = require('../../../utils/mint-api');
const { waiter } = require('../../../utils/fetch');
const extract = require('../../../utils/extract');


async function processor(data, cookies, counter) {
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

  counter.increment();
  post.state = 'DELETED';
  return createInstagramPost(post);
}

module.exports = processor;

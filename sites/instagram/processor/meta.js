const { createInstagramPost } = require('../../../utils/mint-api');
const { getMeta } = require('../meta');


async function processor(post, counter) {
  const meta = await getMeta(post, post.location);

  const postUpdated = {
    ...post,
    meta: {
      ...post.meta,
      ...meta,
    },
  };

  delete postUpdated.location;

  counter.increment();

  return createInstagramPost(postUpdated);
}

module.exports = processor;

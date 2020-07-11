const { createInstagramPost } = require('../../../utils/mint-api');
const { getMeta } = require('../meta');


async function processor(post) {
  const { location } = post;
  const meta = await getMeta(post, location);

  const data = {
    ...post,
    meta: {
      ...post.meta,
      ...meta,
    },
  };

  if (location) {
    if (location.location && !location.location.type) {
      delete data.location.location;
    }

    if (!location.address) {
      delete data.location.address;
    }
  }

  return createInstagramPost(data);
}

module.exports = processor;

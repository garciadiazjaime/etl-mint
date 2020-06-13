const { savePost } = require('../../utils/mint-api');
const { getMeta } = require('./meta');


async function processor(post) {
  const { location } = post;
  const meta = await getMeta(post, location);

  const data = {
    ...post,
    meta,
  };

  if (location && location.location && !location.location.type) {
    delete data.location.location;
  }

  if (location && !location.address) {
    delete data.location.address;
  }


  return savePost(data);
}

module.exports = processor;

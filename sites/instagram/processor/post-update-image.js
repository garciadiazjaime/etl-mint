const debug = require('debug')('app:instagram:proc:update-image');

const { createInstagramPost } = require('../../../utils/mint-api');
const { waiter } = require('../../../utils/fetch');
const extract = require('../../../utils/extract');
const { getData } = require('../post-extract');

function transform(html) {
  const data = getData(html);

  const {
    display_url: mediaUrl,
  } = data.shortcode_media;

  return mediaUrl ? {
    mediaUrl,
  } : {};
}

async function processor(post, cookies, counter) {
  await waiter();

  debug(`extract:${post.id}`);
  const source = 'instagram-post-update-image';
  const html = await extract(post.permalink, source, cookies);

  if (html.includes('Page Not Found')) {
    const postUpdated = {
      ...post,
      state: 'DELETED',
      postUpdate: new Date().toJSON(),
    };

    counter.incremet();

    return createInstagramPost(postUpdated);
  }

  const mediaData = transform(html);

  const postUpdated = {
    ...post,
    ...mediaData,
    postUpdate: new Date().toJSON(),
  };

  return createInstagramPost(postUpdated);
}

module.exports = processor;

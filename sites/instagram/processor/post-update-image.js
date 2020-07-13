const debug = require('debug')('app:instagram:proc:update-image');

const { createInstagramPost } = require('../../../utils/mint-api');
const { waiter } = require('../../../utils/fetch');
const extract = require('../../../utils/extract');
const { getData } = require('../post-extract');

function getMediaUrl(data, type) {
  if (type !== 'GraphImage' || !Array.isArray(data) || !data.length) {
    return null;
  }

  return {
    mediaUrl: data[data.length - 1].src,
  };
}

function transform(html) {
  const data = getData(html);

  const {
    display_resources, __typename,
  } = data.shortcode_media;

  return getMediaUrl(display_resources, __typename);
}

async function processor(post, cookies) {
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

    debug('deleted');

    return createInstagramPost(postUpdated);
  }

  const mediaData = transform(html);

  const postUpdated = {
    ...post,
    ...mediaData,
    postUpdate: new Date().toJSON(),
  };

  debug('updated');

  return createInstagramPost(postUpdated);
}

module.exports = processor;

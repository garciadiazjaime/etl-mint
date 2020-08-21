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

  const source = 'instagram-post-update-image';
  const html = await extract(post.permalink, source, cookies);

  if (html.includes('Page Not Found')) {
    const postUpdated = {
      id: post.id,
      state: 'DELETED',
    };

    return createInstagramPost(postUpdated);
  }

  const mediaData = transform(html);

  const postUpdated = {
    id: post.id,
    ...mediaData,
    invalidImage: false,
  };

  counter.increment();

  return createInstagramPost(postUpdated);
}

module.exports = processor;

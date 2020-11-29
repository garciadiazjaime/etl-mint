const { updateInstagramPost } = require('../../../utils/mint-api');
const { waiter } = require('../../../utils/fetch');
const extract = require('../../../utils/extract');
const { getData } = require('../post-extract');

function transform(html) {
  const data = getData(html);

  const {
    display_url: mediaUrl,
  } = data.shortcode_media;

  return mediaUrl;
}

async function processor(post, cookies) {
  await waiter();

  const source = 'instagram-post-update-image';
  const html = await extract(post.permalink, source, cookies);

  if (html.includes('Page Not Found')) {
    const postUpdated = {
      id: post.id,
      state: 'DELETED',
    };

    return updateInstagramPost(postUpdated);
  }

  const mediaUrl = transform(html);
  if (!mediaUrl) {
    return null;
  }

  const postUpdated = {
    id: post.id,
    mediaUrl,
    invalidImage: false,
  };

  return updateInstagramPost(postUpdated);
}

module.exports = processor;

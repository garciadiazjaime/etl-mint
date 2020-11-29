const debug = require('debug')('app:post-update-image');
const mapSeries = require('async/mapSeries');

const { getPosts, updateInstagramPost } = require('../../../utils/mint-api');
const { getPostToUpdateMedia } = require('../queries-mint-api');
const { getHTMLFromPost } = require('../post-etl');
const { getData } = require('../post-extract');

function transform(html) {
  const data = getData(html);

  const {
    display_url: mediaUrl,
  } = data.shortcode_media;

  return mediaUrl;
}

async function main(cookies) {
  const query = getPostToUpdateMedia();

  const posts = await getPosts(query);

  if (!posts.length) {
    return null;
  }

  const source = 'instagram-post-update-image';

  const responses = await mapSeries(posts, async (post) => {
    const html = await getHTMLFromPost(post, source, cookies);

    if (html.includes('Page Not Found')) {
      debug(`post-deleted: ${post.id}`);
      const postUpdated = {
        id: post.id,
        state: 'DELETED',
      };

      return updateInstagramPost(postUpdated);
    }

    debug(`image-updated: ${post.id}`);
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
  });

  return Promise.all(responses);
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

const debug = require('debug')('app:post-update-image');
const mapSeries = require('async/mapSeries');

const { updateInstagramPost } = require('../../../utils/mint-api');
const { getHTMLFromPost } = require('../post-etl');
const { getData } = require('../post-extract');
const { getRequest, getRequestPlain, waiter } = require('../../../utils/fetch');

function transform(html) {
  const data = getData(html);

  const {
    display_url: mediaUrl,
  } = data.shortcode_media;

  return mediaUrl;
}

async function main(cookies) {
  const profilesByCategory = await getRequest('https://www.feedmetj.com/data/homepage.json');

  const images = profilesByCategory.reduce((accu, item) => {
    accu.push(...item.data);

    return accu;
  }, []).map(({ mediaUrl, id, permalink }) => ({ mediaUrl, id, permalink }));

  debug(`images: ${images.length}`);

  const imagesToUpdate = [];

  await mapSeries(images, async (item) => {
    await waiter();

    const response = await getRequestPlain(item.mediaUrl);

    if (response.status !== 200) {
      imagesToUpdate.push(item);
    }
  });

  debug(`to_update: ${imagesToUpdate.length}`);

  if (!imagesToUpdate.length) {
    return null;
  }

  const source = 'instagram-post-update-image';

  const responses = await mapSeries(imagesToUpdate, async (post) => {
    const html = await getHTMLFromPost(post.permalink, source, cookies);

    if (html.includes('Page Not Found')) {
      debug(`post-deleted: ${post.id}`);
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

    const response = await updateInstagramPost(postUpdated);

    return debug(response);
  });

  return Promise.all(responses);
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

const debug = require('debug')('app:instagram:api');

const fs = require('fs');
const { promisify } = require('util');

const { getRequest } = require('../../utils/fetch');

const readFileAsync = promisify(fs.readFile);


async function extract(config, hashtag) {
  if (config.env !== 'production') {
    const data = await readFileAsync('./stubs/instagram-tijuana.json', { encoding: 'utf8' });
    return JSON.parse(data);
  }

  const limit = 50;
  const fields = 'caption,like_count,comments_count,media_type,media_url,permalink,children{media_type,media_url}';
  const url = `https://graph.facebook.com/v6.0/${hashtag}/recent_media?fields=${fields}&limit=${limit}&user_id=${config.userId}&access_token=${config.token}`;

  return getRequest(url);
}

function transform(data, hashtag) {
  if (!data || !Array.isArray(data.data)) {
    return null;
  }

  return data.data.reduce((accu, item) => {
    if (item.caption && item.media_type !== 'VIDEO') {
      accu.push({
        id: item.id,
        likeCount: item.like_count,
        commentsCount: item.comments_count,
        permalink: item.permalink,
        caption: item.caption,
        mediaUrl: item.media_url,
        mediaType: item.media_type,
        children: item.children && item.children.data,
        source: hashtag,
      });
    }

    return accu;
  }, []);
}

async function getInstagramPosts(config, hashtag) {
  const data = await extract(config, hashtag);
  debug(`hashtag:${hashtag}`);

  const posts = await transform(data, hashtag);
  debug(`posts:${posts && posts.length}`);

  return posts;
}


module.exports.getInstagramPosts = getInstagramPosts;

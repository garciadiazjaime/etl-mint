const debug = require('debug')('app:instagram-api');

const { getRequest } = require('../../utils/fetch');

async function extract(config, hashtag) {
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
    const mediaUrl = item.media_type === 'CAROUSEL_ALBUM' ? item.children.data[0].media_url : item.media_url;

    accu.push({
      id: item.id,
      likeCount: item.like_count,
      commentsCount: item.comments_count,
      permalink: item.permalink,
      caption: item.caption,
      mediaUrl,
      mediaType: item.media_type,
      source: hashtag,
    });

    return accu;
  }, []);
}

async function getInstagramPosts(config, hashtag) {
  debug(`hashtag:${hashtag}`);

  const data = await extract(config, hashtag);

  if (data.error) {
    return debug(data.error);
  }

  const posts = await transform(data, hashtag);
  debug(`posts:${posts && posts.length}`);

  return posts;
}


module.exports = {
  getInstagramPosts,
};

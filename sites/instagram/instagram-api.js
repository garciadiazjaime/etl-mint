const debug = require('debug')('app:instagram:api');

const fs = require('fs');
const { promisify } = require('util');

const { getRequest } = require('../../utils/fetch');

const readFileAsync = promisify(fs.readFile);


async function extract(config) {
  if (config.env !== 'production') {
    return readFileAsync('./stubs/instagram-tijuana.json', { encoding: 'utf8' });
  }

  const limit = 50;
  const fields = 'caption,like_count,comments_count,media_type,media_url,permalink,children{media_type,media_url}';
  const url = `https://graph.facebook.com/v6.0/${config.hashtag}/recent_media?fields=${fields}&limit=${limit}&user_id=${config.userId}&access_token=${config.token}`;

  return getRequest(url);
}

function transform(string, source) {
  const data = JSON.parse(string);

  if (!data || !Array.isArray(data.data)) {
    return null;
  }

  return data.data.reduce((response, item) => {
    if (item.caption && item.media_type !== 'VIDEO') {
      response.push({
        id: item.id,
        likeCount: item.like_count,
        commentsCount: item.comments_count,
        permalink: item.permalink,
        caption: item.caption,
        mediaUrl: item.media_url,
        mediaType: item.media_type,
        children: item.children && item.children.data,
        source,
      });
    }

    return response;
  }, []);
}

async function getPosts(config) {
  const apiResponse = await extract(config);
  debug(`hashtag:${config.hashtag}`);

  const posts = transform(apiResponse, config.hashtag);
  debug(`posts:${posts && posts.length}`);

  return posts;
}


module.exports.getPosts = getPosts;
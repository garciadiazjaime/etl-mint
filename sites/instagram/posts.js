const debug = require('debug')('app:instagram:posts');

const request = require('request-promise');
const fs = require('fs');
const { promisify } = require('util');

const config = require('../../config');

const readFileAsync = promisify(fs.readFile);

function validItem(item) {
  if (!item.caption) {
    return false;
  }

  if (item.media_type === 'VIDEO') {
    return false;
  }

  return true;
}

function getExtractURL(instagramConfig) {
  const limit = 50;
  const fields = 'caption,like_count,comments_count,media_type,media_url,permalink,children{media_type,media_url}';

  return `https://graph.facebook.com/v6.0/${instagramConfig.hashtag}/recent_media?fields=${fields}&limit=${limit}&user_id=${instagramConfig.userId}&access_token=${instagramConfig.token}`;
}

async function extract(env, instagramConfig) {
  if (env !== 'production') {
    return readFileAsync('./stubs/instagram-tijuana.json', { encoding: 'utf8' });
  }

  const url = getExtractURL(instagramConfig);

  return request(url);
}

function transform(string, igHashtagId, city) {
  const data = JSON.parse(string);

  if (!data || !Array.isArray(data.data) || !data.data.length) {
    return null;
  }

  return data.data.reduce((response, item) => {
    if (validItem(item)) {
      response.push({
        id: item.id,
        likeCount: item.like_count,
        commentsCount: item.comments_count,
        permalink: item.permalink,
        caption: item.caption,
        mediaUrl: item.media_url,
        mediaType: item.media_type,
        children: item.children && item.children.data,
        city,
        source: igHashtagId,
      });
    }

    return response;
  }, []);
}

function load(apiUrl, posts) {
  if (!Array.isArray(posts) || !posts.length) {
    return null;
  }

  const options = {
    method: 'POST',
    uri: `${apiUrl}/instagram/post`,
    body: {
      data: posts,
    },
    json: true,
  };

  return request(options);
}

async function main() {
  const env = config.get('env');
  const instagramConfig = {
    token: config.get('instagram.token'),
    hashtag: config.get('instagram.hashtag'),
    userId: config.get('instagram.userId'),
  };
  const apiUrl = config.get('api.url');
  const city = 'tijuana';

  const rawData = await extract(env, instagramConfig);
  debug(`extract:${instagramConfig.hashtag}`);

  const posts = transform(rawData, instagramConfig.hashtag, city);
  debug(`transform:${posts && posts.length}`);

  const response = await load(apiUrl, posts);
  debug(`load:${response && response.length}`);
}

if (require.main === module) {
  main();
}

module.exports = main;

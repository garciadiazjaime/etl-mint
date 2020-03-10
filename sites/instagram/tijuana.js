const request = require('request-promise');
const fs = require('fs');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);

function validItem(item) {
  if (!item.caption) {
    return false;
  }

  if (item.media_type === 'VIDEO') {
    return false;
  }

  const keywords = ['tacos'];

  for (let i = 0; i < keywords.length; i += 1) {
    if (item.caption.toLowerCase().includes(keywords[i])) {
      return true;
    }
  }

  return false;
}

async function extract(env) {
  if (!env) {
    return readFileAsync('./stubs/instagram-tijuana.json', { encoding: 'utf8' });
  }

  const {
    INSTAGRAM_TOKEN: token, INSTAGRAM_HASTAG_ID: igHashtagId, INSTAGRAM_USER_ID: userId,
  } = process.env;
  const url = `https://graph.facebook.com/v6.0/${igHashtagId}/recent_media?fields=caption,like_count,comments_count,media_type,media_url,permalink,children&limit=50&user_id=${userId}&access_token=${token}`;
  return request(url);
}

function transform(string) {
  const data = JSON.parse(string);

  if (!data || !Array.isArray(data.data) || !data.data.length) {
    return null;
  }

  return data.data.reduce((response, item) => {
    if (validItem(item)) {
      response.push(item);
    }

    return response;
  }, []);
}

async function main() {
  const env = '';
  const rawData = await extract(env);
  // console.log(rawData);

  const data = transform(rawData);
  console.log(data);
}

main();

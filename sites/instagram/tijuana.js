const debug = require('debug')('app:instagram');

const request = require('request-promise');
const fs = require('fs');
const { promisify } = require('util');

const { revertMathematicalBold } = require('../../utils/string');
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

function getOptions(caption) {
  const options = [];
  const mapper = [
    ['cafe', 'café|cafe|coffee|latte'],
    ['postre', 'crepa|cupcake|brownie|chocolate|dessert|rebanada|pastel|panaderia|reposteria|galleta|cookie'],
    ['desayuno', 'desayuno|breakfast'],
    ['omelette', 'omelette'],
    ['poke', 'poke'],
    ['tostada', 'tostada'],
    ['sushi', 'sushi'],
    ['teriyaki', 'teriyaki'],
    ['ramen', 'ramen'],
    ['hamburguesa', 'burguer|hamburguesa'],
    ['mariscos', 'mariscos|marlin|jaiba|aguachile|camaron|camarón|atún|atun'],
    ['burro', 'burro|burrito'],
    ['tacos', 'taco|taqueria|taquería'],
    ['bebidas', 'limonada|aguas frescas|agua fresca'],
    ['smoothies', 'smoothies'],
    ['chilaquiles', 'chilaquiles'],
    ['pasta', 'pasta|lasagna'],
    ['pizza', 'pizza'],
    ['torta', 'torta'],
    ['ensalada', 'ensalada'],
    ['vegiee', 'setas|vegan|plantbased|vegiee'],
    ['menudo', 'menudito|menudo|menuderia'],
    ['carne asada', 'carne asada'],
    ['wings', 'wings'],
  ];

  mapper.forEach(([category, regex]) => {
    const regexExpresion = new RegExp(regex, 'i');
    if (regexExpresion.exec(caption)) {
      options.push(category);
    }
  });

  return options;
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
        caption: revertMathematicalBold(item.caption),
        mediaUrl: item.media_url,
        mediaType: item.media_type,
        children: item.children && item.children.data,
        options: getOptions(item.caption),
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

  debug(`instagram:start:${city}`);

  const rawData = await extract(env, instagramConfig);

  const posts = transform(rawData, instagramConfig.hashtag, city);

  const response = await load(apiUrl, posts);

  debug(`instagram:end:${city}:${response.length}`);
}

if (require.main === module) {
  main();
}

module.exports = main;

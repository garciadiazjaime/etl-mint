const debug = require('debug')('app:realstate');

const extract = require('../../utils/extract');
const load = require('../../utils/load');

const point2Homes = require('./point2homes');
const century21global = require('./century21global');
const config = require('../../config');

function getTransformer(source) {
  switch (source) {
    case 'point2homes':
      return point2Homes;

    case 'century21global':
      return century21global;

    default:
      return null;
  }
}

async function main(source) {
  if (!source) {
    return new Error('invalid source');
  }

  const { domain, path } = config.get(`sites.${source}`);
  const url = `${domain}${path}`;
  if (!url) {
    return new Error('invalid url');
  }
  const html = await extract(url, source);


  const transformer = getTransformer(source);
  if (!transformer) {
    return new Error('invalid transformer');
  }
  const data = transformer(html, source);
  debug(`${source}:transform:${data.length}`);


  const response = await load(data);
  if (!response) {
    return new Error('invalid response');
  }
  debug(`${source}:load:${response.length}`);

  return 0;
}

if (require.main === module) {
  main(process.argv[2]);
}

module.exports = main;

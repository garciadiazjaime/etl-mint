const debug = require('debug')('app:realstate');

const extract = require('../../utils/extract');
const load = require('../../utils/load');

const baja123 = require('./baja123');
const century21global = require('./century21global');
const inmuebles24 = require('./inmuebles24');
const point2Homes = require('./point2homes');
const config = require('../../config');

function getTransformer(source) {
  switch (source) {
    case 'baja123':
      return baja123;

    case 'century21global':
      return century21global;

    case 'inmuebles24':
      return inmuebles24;

    case 'point2homes':
      return point2Homes;

    default:
      return null;
  }
}

async function main(source, city = 'tijuana') {
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
  const data = transformer(html, domain);
  debug(`${source}:transform:${data.length}`);


  const response = await load(data, city, source);
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

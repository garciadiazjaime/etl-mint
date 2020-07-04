const debug = require('debug')('app:realstate');

const extract = require('../../utils/extract');
const { createRealState } = require('../../utils/mint-api');

const baja123 = require('./baja123');
const century21global = require('./century21global');
const icasas = require('./icasas');
const inmuebles24 = require('./inmuebles24');
const lamudi = require('./lamudi');
const point2Homes = require('./point2homes');
const propiedades = require('./propiedades');
const trovit = require('./trovit');
const vivanuncios = require('./vivanuncios');
const config = require('../../config');


function getRealStateSites() {
  const sites = config.get('sites');

  return Object.keys(sites).reduce((accu, source) => {
    if (sites[source].active) {
      Object.keys(sites[source].path).forEach((city) => {
        accu.push({ city, source });
      });
    }

    return accu;
  }, []);
}

function getTransformer(source) {
  switch (source) {
    case 'baja123':
      return baja123;

    case 'century21global':
      return century21global;

    case 'icasas':
      return icasas;

    case 'inmuebles24':
      return inmuebles24;

    case 'lamudi':
      return lamudi;

    case 'point2homes':
      return point2Homes;

    case 'propiedades':
      return propiedades;

    case 'trovit':
      return trovit;

    case 'vivanuncios':
      return vivanuncios;

    default:
      return null;
  }
}

async function main({ city, source }) {
  if (!source || !city) {
    const sites = getRealStateSites();
    debug('valid sources:', sites);
    return debug('error:invalid source');
  }

  const { domain, path } = config.get(`sites.${source}`);
  const url = `${domain}${path[city]}`;
  if (!url) {
    return debug('error:invalid url');
  }
  debug(`${source}:extract:${url}`);
  const html = await extract(url, source);


  const transformer = getTransformer(source);
  if (!transformer) {
    return debug('error:invalid transformer');
  }
  let data = transformer(html, domain);

  if (Array.isArray(data) && data.length) {
    data = data.map(item => ({
      ...item,
      source,
      city,
    }));
  }

  debug(`${source}:transform:${data.length}`);

  const response = await createRealState(data);

  if (!response || (Array.isArray(response.errors) && response.errors.length)) {
    return debug('error:invalid response', JSON.stringify(response));
  }

  debug(`${source}:load`);

  return 0;
}

if (require.main === module) {
  const city = process.argv[2];
  const source = process.argv[3];

  main({ city, source });
}

module.exports = main;
module.exports.getRealStateSites = getRealStateSites;

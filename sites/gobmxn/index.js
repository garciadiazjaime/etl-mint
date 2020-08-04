const debug = require('debug')('app:gobmxn');
const cheerio = require('cheerio');
const mapSeries = require('async/mapSeries');

const fs = require('fs');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);

const { getRequestPlain } = require('../../utils/fetch');
const { waiter } = require('../../utils/fetch');
const { createPolitician } = require('../../utils/mint-api');
const config = require('../../config');

function getCounter() {
  let count = 0;

  return () => ({
    increment: () => {
      count += 1;
    },
    reset: () => {
      count = 0;
    },
    count: () => count,
  });
}

const counter = getCounter()();

async function extract(params) {
  if (config.get('env') !== 'production') {
    return readFileAsync(`./stubs/${params.source}.html`, { encoding: 'utf8' });
  }

  let response;
  try {
    response = await getRequestPlain(params.url);
  } catch (error) {
    return debug(error);
  }

  return response.textConverted();
}

function transformList(html) {
  const $ = cheerio.load(html);

  return $('a.linkVerde').toArray().map(item => $(item).attr('href'));
}

function getParty(image) {
  const mapper = {
    morena: 'morena',
    pan: 'pan',
    pri: 'pri',
    pt: 'pt',
    movimiento: 'movimiento social',
    encuentro: 'encuentro ciudadano',
    vrd: 'verde',
    prd: 'prd',
  };

  const key = Object.keys(mapper).find(item => image.toLowerCase().includes(item));

  return mapper[key] || 'sin partido';
}

function getPictureURL(value) {
  return `http://sitl.diputados.gob.mx/LXIV_leg/${value.replace('./', '')}`;
}

function getPartyImageURL(value) {
  return `http://sitl.diputados.gob.mx/LXIV_leg/${value}`;
}

function getImages($) {
  const images = $('img').toArray().map(item => $(item).attr('src'));

  return {
    party: getParty(images[2]),
    partyImageURL: getPartyImageURL(images[2]),
    pictureURL: getPictureURL(images[1]),
  };
}

function getName(value) {
  return value.replace('Dip.', '').trim();
}

function transformView(html, profileURL) {
  const $ = cheerio.load(html);

  const props = $('strong').toArray().map(item => $(item).text().trim());
  const { party, partyImageURL, pictureURL } = getImages($);

  const data = {
    name: getName(props[0]),
    party,
    partyImageURL,
    profileURL,
    pictureURL,
    type: props[1],
    state: props[2],
    circunscripcion: props[4],
    district: props[3],
    email: props[5],
    startDate: props[6],
    status: true,
    role: 'diputado',
  };

  return data;
}

function loadView(data) {
  return createPolitician(data);
}

async function etlView(link) {
  counter.increment();
  await waiter();

  const url = `http://sitl.diputados.gob.mx/LXIV_leg/${link}`;
  debug(counter.count(), url);

  const html = await extract({
    url,
    source: 'diputados-view',
  });

  if (!html) {
    return null;
  }

  const data = transformView(html, url);

  return loadView(data);
}


async function main() {
  debug('start');
  counter.reset();
  const html = await extract({
    url: 'http://sitl.diputados.gob.mx/LXIV_leg/listado_diputados_gpnp.php',
    source: 'diputados-list',
  });

  if (!html) {
    return null;
  }

  const list = transformList(html);

  if (!Array.isArray(list) || !list.length) {
    debug('no-links');
  }
  debug(`#links: ${list.length}`);

  return mapSeries(list, async (item) => {
    await etlView(item);
  });
}

if (require.main === module) {
  main()
    .then(() => process.exit(1))
    .catch(debug);
}

module.exports = main;

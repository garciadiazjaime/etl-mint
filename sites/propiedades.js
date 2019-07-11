const request = require('request-promise');
const cheerio = require('cheerio');
const debug = require('debug')('app:propiedades');
const cloudscraper = require('cloudscraper');

const config = require('../config');

const MAX_REQUEST = config.get('sites.propiedades.max_request');
const WAIT_SECS = config.get('sites.propiedades.wait_secs');

function getCurrency(value) {
  if (!value) {
    return '';
  }

  if (value.toUpperCase().includes('USD')) {
    return 'USD';
  }

  if (value.search(/MXN|MDP|MN/i) !== -1) {
    return 'MXN';
  }

  return '';
}

function getMultiplier(value) {
  if (!value) {
    return 1;
  }

  if (value.toLowerCase().includes('mil')) {
    return 1000;
  }

  if (value.toLowerCase().includes('mdp')) {
    return 1000000;
  }

  return 1;
}

function getPrice(value) {
  if (!value) {
    return '';
  }

  const results = value.match(/[\d]+\.?[\d]+/);

  if (results && results.length) {
    const price = parseFloat(results[0]);

    const multiplier = getMultiplier(value);

    return price * multiplier;
  }

  return '';
}

async function extract(url) {
  return cloudscraper.get(url);
}

function cleanString(value) {
  return value ? value.replace(/\r?\n|\r|\t|"|!|“|”/g, '').replace(/  +/g, ' ').trim() : '';
}

function transform(html) {
  const $ = cheerio.load(html);

  return $('.properties-list').toArray().map((element) => {
    const value = $(element).find('.price').text();
    const price = getPrice(value);
    const currency = getCurrency(value);
    const description = cleanString($(element).find('.description-list h4').text());
    const image = $(element).find('.thumbnail-slider img').data('src');
    const url = $(element).data('href');
    const address = cleanString($(element).find('.address .title-property a').text());
    const latitude = $(element).find('meta[itemprop="latitude"]').attr('content');
    const longitude = $(element).find('meta[itemprop="longitude"]').attr('content');
    const city = 'tijuana';
    const source = 'propiedades';

    const place = {
      price,
      currency,
      description,
      image,
      url,
      address,
      city,
      source,
      latitude,
      longitude,
    };

    return place;
  });
}

function load(apiUrl, places) {
  if (!places || !places.length) {
    return null;
  }

  const options = {
    method: 'POST',
    uri: `${apiUrl}/real-state/place`,
    body: {
      places,
    },
    json: true,
  };
  debug(`loading to ${options.uri}`);

  return request(options);
}

function doNext(html) {
  const $ = cheerio.load(html);
  return !!$('.pagination-result .siguiente').length;
}

async function loadHelper(domain, path, pageNumber) {
  if (pageNumber > MAX_REQUEST) {
    return;
  }

  const url = domain + path + pageNumber;
  debug(`extracting from ${url}, pageNumber: ${pageNumber}`);

  const html = await extract(url);

  const places = transform(html);
  debug(`${places.length} places extracted`);

  await load(config.get('api.url'), places);

  const next = doNext(html);
  if (next) {
    setTimeout(() => loadHelper(domain, path, pageNumber + 1), WAIT_SECS);
  }
}

async function main() {
  const domain = config.get('sites.propiedades.domain');
  const path = config.get('sites.propiedades.path');
  const active = config.get('sites.propiedades.active');

  if (active) {
    loadHelper(domain, path, 1);
  } else {
    debug('etl disabled');
  }
}

module.exports = main;

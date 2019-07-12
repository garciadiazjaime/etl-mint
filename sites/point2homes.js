const request = require('request-promise');
const cheerio = require('cheerio');
const debug = require('debug')('app:point2homes');

const puppeteer = require('puppeteer');

const config = require('../config');

const MAX_REQUEST = config.get('sites.point2homes.max_request');
const WAIT_SECS = config.get('sites.point2homes.wait_secs');

function getCurrency(value) {
  if (!value) {
    return '';
  }

  if (value.toUpperCase().includes('USD')) {
    return 'USD';
  }

  if (value.toUpperCase().includes('MXN')) {
    return 'MXN';
  }

  return '';
}

function getPrice(value) {
  if (!value) {
    return '';
  }

  return value.replace(/\D/g, '');
}

async function extract(url, page) {
  await page.goto(url);

  const bodyHandle = await page.$('body');
  const html = await page.evaluate(body => body.innerHTML, bodyHandle);

  await bodyHandle.dispose();

  return html;
}

function cleanString(value) {
  return value ? value.replace(/\r?\n|\r/g, '').replace(/  +/g, ' ') : '';
}

function transform(html, domain) {
  const $ = cheerio.load(html);

  return $('.listings .items .item-cnt').toArray().map((element) => {
    const value = $(element).find('.price').text();
    const price = getPrice(value);
    const currency = getCurrency(value);
    const description = cleanString($(element).find('.item-info-cnt .characteristics-cnt').text().trim());
    const latitude = $(element).find('.inner-left input[name^="Latitude"]').val();
    const longitude = $(element).find('.inner-left input[name^="Longitude"]').val();
    const image = $(element).find('.photo-inner img').data('original');
    const url = domain + $(element).find('.photo-inner a').attr('href');
    const address = $(element).find('.inner-left input[name^="ShortAddress"]').val();
    const city = 'tijuana';
    const source = 'point2homes';

    const place = {
      price,
      currency,
      description,
      latitude,
      longitude,
      image,
      url,
      address,
      city,
      source,
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
  const next = $('.pager li.next').length;
  return !!next;
}

async function loadHelper(domain, path, pageNumber, page, browser) {
  if (pageNumber > MAX_REQUEST) {
    browser.close();
    return;
  }

  const url = domain + path + pageNumber;
  debug(`extracting from ${url}`);

  const html = await extract(url, page);

  const places = transform(html, domain);

  debug(`${places.length} places extracted`);

  await load(config.get('api.url'), places);

  const next = doNext(html);

  if (next) {
    setTimeout(() => loadHelper(domain, path, pageNumber + 1, page, browser), WAIT_SECS);
  } else {
    browser.close();
  }
}

async function main() {
  const domain = config.get('sites.point2homes.domain');
  const path = config.get('sites.point2homes.path');
  const active = config.get('sites.point2homes.active');
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3847.0 Safari/537.36';

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setUserAgent(userAgent);
  await page.goto(domain);

  if (active) {
    loadHelper(domain, path, 1, page, browser);
  } else {
    debug('etl disabled');
  }
}


module.exports = main;

const fs = require('fs');
const { promisify } = require('util');

const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const request = require('request-promise');
const debug = require('debug')('app:realstate');

const readFileAsync = promisify(fs.readFile);

const config = require('../../config');
const { getPrice, getCurrency } = require('../../utils/currency');

const source = 'century21global';

async function extract() {
  const { domain, path } = config.get(`sites.${source}`);
  const url = `${domain}${path}`;

  if (config.get('env') !== 'production') {
    return readFileAsync(`./stubs/${source}.html`, { encoding: 'utf8' });
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--headless',
    ],
  });
  const page = await browser.newPage();


  await page.goto(url);

  const html = await page.content();
  await browser.close();

  return html;
}

function transform(html) {
  const { domain } = config.get(`sites.${source}`);
  const $ = cheerio.load(html);

  return $('.search-result').toArray().map((element) => {
    const value = $(element).find('.price-native').text();
    const price = getPrice(value);
    const currency = getCurrency(value);
    const size = $(element).find('.size').text().trim();
    const description = $(element).find('.search-result-label').last().text();
    const latitude = $(element).find('.map-coordinates').data('lat');
    const longitude = $(element).find('.map-coordinates').data('lng');
    const images = [$(element).find('.search-result-img').css('background-image').replace('url(\'', '')
      .replace('\')', '')
      .replace(/"/gi, '')];
    const url = domain + $(element).find('.search-result-photo').attr('href');
    const address = $(element).find('.property-address').text();
    const city = 'tijuana';

    return {
      price,
      currency,
      description: size ? `${description}. ${size}` : description,
      latitude,
      longitude,
      images,
      url,
      address,
      city,
      source,
    };
  });
}

function load(apiUrl, data) {
  if (!Array.isArray(data) || !data.length) {
    return null;
  }

  const options = {
    method: 'POST',
    uri: `${apiUrl}/real-state`,
    body: {
      data,
    },
    json: true,
  };

  return request(options);
}

async function main() {
  const html = await extract();

  const data = transform(html);
  debug(`${source}:transform:${data.length}`);

  const response = await load(config.get('api.url'), data);
  debug(`${source}:load:${response && response.length}`);
}

if (require.main === module) {
  main();
}

module.exports = main;

/* eslint class-methods-use-this: 0 */

const request = require('request-promise');
const cheerio = require('cheerio');

const RealState = require('../crawler/realState');
const { getPrice, getCurrency } = require('../crawler/realState');

class Century21Global extends RealState {
  constructor() {
    super();
    this.site = 'century21global';
  }

  extract(url) {
    return request(url);
  }

  transform(html, domain) {
    const $ = cheerio.load(html);

    return $('.search-result').toArray().map((element) => {
      const value = $(element).find('.price-native').text();
      const price = getPrice(value);
      const currency = getCurrency(value);
      const size = $(element).find('.size').text().trim();
      const description = $(element).find('.search-result-label').last().text();
      const latitude = $(element).find('.map-coordinates').data('lat');
      const longitude = $(element).find('.map-coordinates').data('lng');
      const image = $(element).find('.search-result-img').css('background-image').replace('url(\'', '')
        .replace('\')', '')
        .replace(/"/gi, '');
      const url = domain + $(element).find('.search-result-photo').attr('href');
      const address = $(element).find('.property-address').text();
      const city = 'tijuana';
      const source = 'century21global';

      return {
        price,
        currency,
        description: size ? `${description}. ${size}` : description,
        latitude,
        longitude,
        image,
        url,
        address,
        city,
        source,
      };
    });
  }

  doNext(html) {
    const $ = cheerio.load(html);
    const next = $('.pagination li.disabled a[aria-label=Next]').length;
    return !next;
  }
}

module.exports = Century21Global;

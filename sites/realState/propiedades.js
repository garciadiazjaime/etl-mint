/* eslint class-methods-use-this: 0 */

const cheerio = require('cheerio');
const cloudscraper = require('cloudscraper');

const RealState = require('../../crawler/realState');
const { getPrice, getCurrency } = require('../../utils/currency');
const { cleanString } = require('../../utils/string');

class Propiedades extends RealState {
  constructor() {
    super();
    this.source = 'propiedades';
    this.browser = null;
    this.page = null;
  }

  doNext(html) {
    const $ = cheerio.load(html);
    return !!$('.pagination-result .siguiente').length;
  }

  async extract(url, pageNumber) {
    return cloudscraper.get(url + pageNumber);
  }

  transform(html) {
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
      const { source } = this;

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
}

module.exports = Propiedades;

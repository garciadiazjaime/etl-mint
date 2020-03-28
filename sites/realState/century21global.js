const cheerio = require('cheerio');

const config = require('../../config');
const { getPrice, getCurrency } = require('../../utils/currency');

function transform(html, source) {
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

module.exports = transform;

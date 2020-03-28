
const cheerio = require('cheerio');

const { getPrice, getCurrency } = require('../../utils/currency');
const { cleanString } = require('../../utils/string');
const config = require('../../config');

function transform(html, source) {
  const { domain } = config.get(`sites.${source}`);
  const $ = cheerio.load(html);

  return $('.listings .items .item-cnt').toArray().map((element) => {
    const value = $(element).find('.price').text();
    const price = getPrice(value);
    const currency = getCurrency(value);
    const description = cleanString($(element).find('.item-info-cnt .characteristics-cnt').text().trim());
    const latitude = $(element).find('.inner-left input[name^="Latitude"]').val();
    const longitude = $(element).find('.inner-left input[name^="Longitude"]').val();
    const images = [$(element).find('.photo-inner img').data('original')];
    const url = domain + $(element).find('.photo-inner a').attr('href');
    const address = $(element).find('.inner-left input[name^="ShortAddress"]').val();
    const city = 'tijuana';

    const place = {
      price,
      currency,
      description,
      latitude,
      longitude,
      images,
      url,
      address,
      city,
      source,
    };

    return place;
  });
}

module.exports = transform;

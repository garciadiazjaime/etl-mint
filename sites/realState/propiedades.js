const cheerio = require('cheerio');

const { getPrice, getCurrency } = require('../../utils/currency');
const { cleanString } = require('../../utils/string');

function transform(html) {
  const $ = cheerio.load(html);

  return $('.properties-list').toArray().map((element) => {
    const value = $(element).find('.price').text();
    const price = getPrice(value);
    const currency = getCurrency(value);
    const description = cleanString($(element).find('.description-list h4').text());
    const images = [$(element).find('.thumbnail-slider img').data('src')];
    const url = $(element).data('href');
    const address = cleanString($(element).find('.address .title-property a').text());
    const latitude = $(element).find('meta[itemprop="latitude"]').attr('content');
    const longitude = $(element).find('meta[itemprop="longitude"]').attr('content');

    const place = {
      address,
      currency,
      description,
      images,
      latitude,
      longitude,
      price,
      url,
    };

    return place;
  });
}

module.exports = transform;

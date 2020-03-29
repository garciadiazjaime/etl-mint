const cheerio = require('cheerio');

const { getCurrency } = require('../../utils/currency');
const { cleanString } = require('../../utils/string');

function transform(html) {
  const $ = cheerio.load(html);

  return $('div[itemprop="offers"]').toArray().map((element) => {
    const value = $(element).find('.amount').text();
    const price = $(element).find('meta[itemprop="price"]').attr('content');
    const currency = getCurrency(value);
    const description = `${$(element).find('a').attr('title')} ${cleanString($(element).find('div.description').text())}`;
    const images = [$(element).find('img').attr('src')];
    const url = $(element).find('a').attr('href');
    const address = cleanString($(element).find('h5[itemprop="address"]').text());
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

const cheerio = require('cheerio');

const { getPrice, getCurrency } = require('../../utils/currency');
const { cleanStart, cleanString } = require('../../utils/string');

function transform(html) {
  const $ = cheerio.load(html);

  return $('.listview-item-cnt .item-cnt').toArray().map((element) => {
    const value = $(element).find('.item-price span').text();
    const price = getPrice(value);
    const currency = getCurrency(value);
    const highlight = $(element).find('.label-highlight').text();
    const details = $(element).find('.item-details').text();
    const description = cleanString(`${highlight}. ${details}`);
    const images = [$(element).find('.item-photo img').attr('src')];
    const url = $(element).find('.item-photo a').attr('href');
    const address = cleanStart($(element).find('.item-address h2 a').text());

    const place = {
      price,
      currency,
      description,
      images,
      url,
      address,
    };

    return place;
  });
}

module.exports = transform;

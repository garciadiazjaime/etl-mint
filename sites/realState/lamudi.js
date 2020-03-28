const cheerio = require('cheerio');

const { getPrice, getCurrency } = require('../../utils/currency');
const { cleanString } = require('../../utils/string');

function transform(html) {
  const $ = cheerio.load(html);

  return $('.js-listingContainer .ListingCell-row .ListingCell-content').toArray().map((element) => {
    const value = $(element).find('.ListingCell-KeyInfo-price a').text().trim();
    const price = getPrice(value);
    const currency = getCurrency(value);
    const description = cleanString($(element).find('.ListingCell-shortDescription a').text());
    const images = [$(element).find('.ListingCell-image img').data('src')];
    const url = $(element).find('.js-listing-link').attr('href');
    const address = cleanString($(element).find('.ListingCell-KeyInfo-address .js-listing-link').text());

    const place = {
      address,
      currency,
      description,
      images,
      price,
      url,
    };

    return place;
  });
}

module.exports = transform;

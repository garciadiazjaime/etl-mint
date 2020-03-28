const cheerio = require('cheerio');

const { getPrice, getCurrency } = require('../../utils/currency');
const { cleanString } = require('../../utils/string');

function getImage($, element) {
  const image = $(element).find('.posting-gallery-slider .flickity-slider .is-selected img').attr('src');
  if (image) {
    return image;
  }

  const galleryHTML = $(element).find('.posting-gallery-slider').html();
  const images = galleryHTML.match(/https:\/\/[\w\.\/]*/gi);

  return Array.isArray(images) ? images[0] : '';
}

function transform(html, domain) {
  const $ = cheerio.load(html);

  const places = $('.list-card-container > div .general-content').toArray().map((element) => {
    const value = $(element).find('.posting-price .first-price').text().trim();
    const price = getPrice(value);
    const currency = getCurrency(value);
    const description = cleanString($(element).find('.posting-description').text());
    const images = [getImage($, element)];
    const url = domain + $(element).find('.posting-title a').attr('href');
    const address = cleanString($(element).find('.posting-location').text());

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

  return places;
}

module.exports = transform;

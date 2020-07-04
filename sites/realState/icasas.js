const cheerio = require('cheerio');

const { getPrice, getCurrency } = require('../../utils/currency');
const { getLocation } = require('./shared');

function transform(html, domain) {
  const $ = cheerio.load(html);

  return $('li[itemtype="https://schema.org/Residence"]').toArray().map((element) => {
    const value = $(element).find('.price').text();
    const price = getPrice(value);
    const currency = getCurrency(value);
    const description = `${$(element).find('.title ').last().text()} ${$(element).find('.description ').last().text()}`;
    const latitude = $(element).find('meta[itemprop="latitude"]').attr('content');
    const longitude = $(element).find('meta[itemprop="longitude"]').attr('content');
    const images = [$(element).find('img.ill').data('src')];
    const url = domain + $(element).find('.title a').attr('href');
    const address = $(element).find('meta[itemprop="addressLocality"]').attr('content');

    let place = {
      address,
      currency,
      description,
      images,
      price,
      url,
    };

    place = getLocation(place, latitude, longitude);

    return place;
  });
}

module.exports = transform;

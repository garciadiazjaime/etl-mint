const cheerio = require('cheerio');

const { cleanString } = require('../../utils/string');

function getJSONdata(data, url) {
  return data.filter(item => item.url === url)[0] || {};
}

function transform(html, domain) {
  const $ = cheerio.load(html);

  const ldJSON = JSON.parse($("script[type='application/ld+json']").get()[0].children[0].data);

  return $('.viewport-contents .tileV2.promoted, .viewport-contents .tileV2.REAdTileV2[data-tileadid]').toArray().map((element) => {
    const description = cleanString($(element).find('.expanded-description').text());
    const images = [$(element).find('img.lazyload').data('src')];
    const url = domain + $(element).find('.tile-title-text').attr('href');
    const address = cleanString($(element).find('.tile-location').text());
    const { price, priceCurrency: currency } = getJSONdata(ldJSON, url);

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

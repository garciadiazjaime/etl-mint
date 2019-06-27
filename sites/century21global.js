const request = require('request-promise');
const cheerio = require('cheerio');
const debug = require('debug')('century21global')

const config = require('../config');

const MAX_REQUEST = config.get('sites.century21global.max_request')
const WAIT_SECS = config.get('sites.century21global.wait_secs')

function getCurrency(value) {
  if (!value) {
    return ''
  }

  if (value.toUpperCase().includes('USD')) {
    return 'USD'
  }

  if (value.toUpperCase().includes('MXN')) {
    return 'MXN'
  }

  return ''
}

function getPrice(value) {
  if (!value) {
    return ''
  }

  return value.replace(/\D/g,'') 
}

function extract(url) {
  return request(url)
}

function transform(html, domain) {
  const $ = cheerio.load(html);

  return $('.search-result').toArray().map((element) => {
    const value = $(element).find('.price-native').text()
    const price = getPrice(value)
    const currency = getCurrency(value)
    const size = $(element).find('.size').text().trim()
    const description = $(element).find('.search-result-label').last().text()
    const latitude = $(element).find('.map-coordinates').data('lat')
    const longitude = $(element).find('.map-coordinates').data('lng')
    const image = $(element).find('.search-result-img').css('background-image').replace('url(\'','').replace('\')','').replace(/\"/gi, "")
    const url = domain + $(element).find('.search-result-photo').attr('href')
    const address = $(element).find('.property-address').text()
    const city = $(element).find('.search-result-label').first().text().trim()

    const place = {
      price,
      currency,
      size,
      description,
      latitude,
      longitude,
      image,
      url,
      address,
      city
    }

    return place
  })
}

function load(apiUrl, places) {
  if (!places || !places.length){
    return
  }

  const options = {
      method: 'POST',
      uri: `${apiUrl}/real-state/place`,
      body: {
        places
      },
      json: true
  };
  
  return request(options)
}

function doNext(html) {
  const $ = cheerio.load(html);
  const next = $('.pagination li.disabled a[aria-label=Next]').length
  return !next
}

async function loadHelper(domain, path, page) {
  if (page > MAX_REQUEST) {
    return
  }

  const url = domain + path + page
  debug(`loading ${url}`)

  const html = await extract(url)
  const places = transform(html, domain)

  debug(`saving ${places.length} places`)

  const response = await load(config.get('api.url'), places)
  debug(response)

  const next = doNext(html)

  if(next) {
    setTimeout(() => loadHelper(domain, path, page + 1), WAIT_SECS)
  }
}


module.exports = function() {
  const domain = config.get('sites.century21global.domain')
  const path = config.get('sites.century21global.path')

  loadHelper(domain, path, 1)
}



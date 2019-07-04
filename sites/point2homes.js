const request = require('request-promise');
const cheerio = require('cheerio');
const debug = require('debug')('app:point2homes')

const config = require('../config');

const MAX_REQUEST = config.get('sites.point2homes.max_request')
const WAIT_SECS = config.get('sites.point2homes.wait_secs')

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
  const options = {
    url,
    headers: {
      cookie: 'visid_incap_1719354=eE8PrBkCQUG8bCyXqNnKOpctHl0AAAAAQUIPAAAAAAA80p3nGHJelC4ux2mn0oau; incap_ses_115_1719354=0hmYA++UwQtrITVLpZCYAZctHl0AAAAAOz+IDxy6gDVdrF6J1vaWWw==;'
    }
  };

  return request(options)
}

function cleanString(value)
{
  return value ? value.replace(/\r?\n|\r/g, '').replace(/  +/g, ' ') : ''
}

function transform(html, domain) {
  const $ = cheerio.load(html);

  return $('.listings .items .item-cnt').toArray().map(element => {
    const value = $(element).find('.price').text()
    const price = getPrice(value)
    const currency = getCurrency(value)
    const description = cleanString($(element).find('.item-info-cnt .characteristics-cnt').text().trim())
    const latitude = $(element).find('.inner-left input[name^="Latitude"]').val()
    const longitude = $(element).find('.inner-left input[name^="Longitude"]').val()
    const image = $(element).find('.photo-inner img').data('original')
    const url = domain + $(element).find('.photo-inner a').attr('href')
    const address = $(element).find('.inner-left input[name^="ShortAddress"]').val()
    const city = "tijuana"

    const place = {
      price,
      currency,
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
  debug(`loading to ${options.uri}`)
  
  return request(options)
}

function doNext(html) {
  const $ = cheerio.load(html);
  const next = $('.pager li.next').length
  return !!next
}

async function loadHelper(domain, path, page) {
  if (page > MAX_REQUEST) {
    return
  }

  const url = domain + path + page
  debug(`extracting from ${url}`)

  const html = await extract(url)
  const places = transform(html, domain)

  debug(`${places.length} places extracted`)

  await load(config.get('api.url'), places)

  const next = doNext(html)

  if(next) {
    setTimeout(() => loadHelper(domain, path, page + 1), WAIT_SECS)
  }
}


module.exports = function() {
  const domain = config.get('sites.point2homes.domain')
  const path = config.get('sites.point2homes.path')
  const active = config.get('sites.point2homes.active')

  if (active) {
    loadHelper(domain, path, 1)
  } else {
    debug('etl disabled')
  }
}



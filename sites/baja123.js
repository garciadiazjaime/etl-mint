const request = require('request-promise');
const cheerio = require('cheerio');
const debug = require('debug')('app:baja123')

const puppeteer = require('puppeteer');

const config = require('../config');

const MAX_REQUEST = config.get('sites.baja123.max_request')
const WAIT_SECS = config.get('sites.baja123.wait_secs')

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

async function extract(url, pageNumber, page) {
  await page.goto(url);

  if (pageNumber > 1 ) {
    const selector = `.Pager a:nth-of-type(${pageNumber})`
    await Promise.all([
      page.waitForNavigation(),
      page.click(selector),
    ]);
  } 
  
  const bodyHandle = await page.$('body');
  const html = await page.evaluate(body => body.innerHTML, bodyHandle);
  await bodyHandle.dispose();

  return html
}

function cleanString(value) {
  return value ? value.replace(/\r?\n|\r|\t|"|!|”/g, '').replace(/  +/g, ' ').trim() : ''
}

function cleanStart(value) {
  return value ? value.replace(/^, /, '') : value
}


function transform(html) {
  const $ = cheerio.load(html);

  return $('.listview-item-cnt .item-cnt').toArray().map(element => {
    const value = $(element).find('.item-price span').text()
    const price = getPrice(value)
    const currency = getCurrency(value)
    const highlight = $(element).find('.label-highlight').text()
    const details = $(element).find('.item-details').text()
    const image = $(element).find('.item-photo img').attr('src')
    const url = $(element).find('.item-photo a').attr('href')
    const address = cleanStart($(element).find('.item-address h2 a').text())
    const city = "tijuana"

    const place = {
      price,
      currency,
      description: cleanString(`${highlight}. ${details}`),
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
  const next = $('.Pager a[disabled="disabled"]').text().toLowerCase().includes('next')
  return !next
}

async function loadHelper(domain, path, pageNumber, page, browser) {
  if (pageNumber > MAX_REQUEST) {
    await browser.close();
    return
  }

  const url = domain + path
  debug(`extracting from ${url}, pageNumber: ${pageNumber}`)

  const html = await extract(url, pageNumber, page)

  const places = transform(html)

  debug(`${places.length} places extracted`)

  await load(config.get('api.url'), places)

  const next = doNext(html)
  if(next) {
    setTimeout(() => loadHelper(domain, path, pageNumber + 1, page, browser), WAIT_SECS)
  }
}


module.exports = async function() {
  const domain = config.get('sites.baja123.domain')
  const path = config.get('sites.baja123.path')
  const active = config.get('sites.baja123.active')

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  if (active) {
    loadHelper(domain, path, 1, page, browser)
  } else {
    debug('etl disabled')
  }
}



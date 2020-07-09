const debug = require('debug')('app:realstate');

const fs = require('fs');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const { getBrowser } = require('./browser');
const config = require('../config');

async function extract(url, source, cookies) {
  if (config.get('env') !== 'production') {
    return readFileAsync(`./stubs/${source}.html`, { encoding: 'utf8' });
  }

  const browser = await getBrowser();
  const page = await browser.newPage();

  if (Array.isArray(cookies) && cookies.length) {
    await page.setCookie(...cookies);
  }

  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4152.0 Safari/537.36';
  await page.setUserAgent(userAgent);

  try {
    await page.goto(url);
  } catch (error) {
    debug(error);
  }

  const html = await page.content();
  await browser.close();

  return html;
}

module.exports = extract;

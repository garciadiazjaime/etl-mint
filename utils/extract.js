const debug = require('debug')('app:realstate');

const fs = require('fs');
const { promisify } = require('util');

const puppeteer = require('puppeteer');

const readFileAsync = promisify(fs.readFile);
const config = require('../config');

async function extract(url, source) {
  if (config.get('env') !== 'production') {
    return readFileAsync(`./stubs/${source}.html`, { encoding: 'utf8' });
  }

  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4152.0 Safari/537.36';
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--headless',
    ],
  });
  const page = await browser.newPage();
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

const puppeteer = require('puppeteer');

const config = require('../config');

async function getBrowser() {
  const opts = config.get('env') !== 'production' ? {} : {
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--headless',
    ],
  };

  const browser = await puppeteer.launch(opts);

  return browser;
}

module.exports = {
  getBrowser,
};

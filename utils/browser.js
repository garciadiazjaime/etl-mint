const puppeteer = require('puppeteer');

async function getBrowser() {
  const opts = {
    headless: true,
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

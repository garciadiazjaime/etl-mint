const debug = require('debug')('app:login-processor');

const puppeteer = require('puppeteer');

const config = require('../../config');

async function main() {
  const url = 'https://www.instagram.com/accounts/login/?next=/p/CAlG4Vwge7m/';

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

  debug('start');
  const page = await browser.newPage();
  await page.setUserAgent(userAgent);

  await page.goto(url);

  await page.waitForSelector('form', { timeout: 1000 * 3 });

  await page.type('input[name="username"]', config.get('instagram.username'));
  await page.type('input[name="password"]', config.get('instagram.password'));

  await page.click('button[type="submit"]');

  await page.waitForNavigation();

  const cookies = await page.cookies();

  await browser.close();
  debug('end');

  return cookies;
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

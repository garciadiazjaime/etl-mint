/* eslint class-methods-use-this: 0 */

const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const RealState = require('../../crawler/realState');
const { getPrice, getCurrency } = require('../../utils/currency');

class Century21Global extends RealState {
  constructor() {
    super();
    this.source = 'century21global';
    this.browser = null;
    this.page = null;
  }

  async preHook() {
    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3847.0 Safari/537.36';
    this.browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--disable-gpu',
        '--headless',
      ],
    });
    this.page = await this.browser.newPage();
    await this.page.setUserAgent(userAgent);
  }

  async afterHook() {
    await this.browser.close();
  }

  doNext(html) {
    const $ = cheerio.load(html);
    const next = $('.pagination li.disabled a[aria-label=Next]').length;
    return !next;
  }

  async extract(url, pageNumber) {
    if (pageNumber > 1) {
      const selector = '.pagination a[aria-label="Next"]';
      await Promise.all([
        this.page.waitForNavigation(),
        this.page.click(selector),
      ]);
    } else {
      await this.page.goto(url);
    }

    const html = await this.page.content();

    return html;
  }

  transform(html, domain) {
    const $ = cheerio.load(html);

    return $('.search-result').toArray().map((element) => {
      const value = $(element).find('.price-native').text();
      const price = getPrice(value);
      const currency = getCurrency(value);
      const size = $(element).find('.size').text().trim();
      const description = $(element).find('.search-result-label').last().text();
      const latitude = $(element).find('.map-coordinates').data('lat');
      const longitude = $(element).find('.map-coordinates').data('lng');
      const images = [$(element).find('.search-result-img').css('background-image').replace('url(\'', '')
        .replace('\')', '')
        .replace(/"/gi, '')];
      const url = domain + $(element).find('.search-result-photo').attr('href');
      const address = $(element).find('.property-address').text();
      const city = 'tijuana';
      const { source } = this;

      return {
        price,
        currency,
        description: size ? `${description}. ${size}` : description,
        latitude,
        longitude,
        images,
        url,
        address,
        city,
        source,
      };
    });
  }
}

async function main() {
  const task = new Century21Global();
  await task.main();
}

if (require.main === module) {
  main();
}

module.exports = Century21Global;

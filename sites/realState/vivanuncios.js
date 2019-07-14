/* eslint class-methods-use-this: 0 */

const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const RealState = require('../../crawler/realState');
const { getPrice, getCurrency } = require('../../utils/currency');
const { cleanString } = require('../../utils/string');

class Vivanuncios extends RealState {
  constructor() {
    super();
    this.source = 'vivanuncios';
    this.browser = null;
    this.page = null;
  }

  async preHook(domain) {
    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3847.0 Safari/537.36';
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
    await this.page.setUserAgent(userAgent);
    await this.page.goto(domain);
  }

  async afterHook() {
    await this.browser.close();
  }

  doNext(html) {
    const $ = cheerio.load(html);
    const next = !!$('.pagination .icon-right-arrow').length;
    return next;
  }

  async extract(url, pageNumber) {
    if (pageNumber > 1) {
      const selector = '.pagination .icon-right-arrow';
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
    const defaultCurrency = 'MXN';

    return $('.viewport-contents .tileV2.promoted, .viewport-contents .tileV2.regular').toArray().map((element) => {
      const value = $(element).find('.ad-price').text().trim();
      const price = getPrice(value);
      const currency = getCurrency(value) || defaultCurrency;
      const description = cleanString($(element).find('.expanded-description').text());
      const image = $(element).find('.pictureLoading img').data('src');
      const url = domain + $(element).find('.tile-title-text').attr('href');
      const address = cleanString($(element).find('.tile-location').text());
      const city = 'tijuana';
      const { source } = this;

      const place = {
        price,
        currency,
        description,
        image,
        url,
        address,
        city,
        source,
      };

      return place;
    });
  }
}

module.exports = Vivanuncios;

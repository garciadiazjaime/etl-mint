/* eslint class-methods-use-this: 0 */

const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const RealState = require('../../crawler/realState');
const { getPrice, getCurrency } = require('../../utils/currency');
const { cleanStart, cleanString } = require('../../utils/string');

class Baja123 extends RealState {
  constructor() {
    super();
    this.source = 'baja123';
    this.browser = null;
    this.page = null;
  }

  async preHook() {
    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3847.0 Safari/537.36';
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
    await this.page.setUserAgent(userAgent);
  }

  async afterHook() {
    await this.browser.close();
  }

  doNext(html) {
    const $ = cheerio.load(html);
    const next = $('.Pager a[disabled="disabled"]').text().toLowerCase().includes('next');
    return !next;
  }

  async extract(url, pageNumber) {
    if (pageNumber > 1) {
      const selector = `.Pager a:nth-of-type(${pageNumber})`;
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

  transform(html) {
    const $ = cheerio.load(html);

    return $('.listview-item-cnt .item-cnt').toArray().map((element) => {
      const value = $(element).find('.item-price span').text();
      const price = getPrice(value);
      const currency = getCurrency(value);
      const highlight = $(element).find('.label-highlight').text();
      const details = $(element).find('.item-details').text();
      const description = cleanString(`${highlight}. ${details}`);
      const image = $(element).find('.item-photo img').attr('src');
      const url = $(element).find('.item-photo a').attr('href');
      const address = cleanStart($(element).find('.item-address h2 a').text());
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

module.exports = Baja123;

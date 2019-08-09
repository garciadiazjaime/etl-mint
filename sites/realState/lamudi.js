/* eslint class-methods-use-this: 0 */

const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const RealState = require('../../crawler/realState');
const { getPrice, getCurrency } = require('../../utils/currency');
const { cleanString } = require('../../utils/string');

class Lamudi extends RealState {
  constructor() {
    super();
    this.source = 'lamudi';
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
    const next = !!$('.Pagination .next a').length;
    return next;
  }

  async extract(url, pageNumber) {
    if (pageNumber > 1) {
      const selector = '.Pagination .next a';
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

    return $('.js-listingContainer .ListingCell-row .ListingCell-content').toArray().map((element) => {
      const value = $(element).find('.ListingCell-KeyInfo-price a').text().trim();
      const price = getPrice(value);
      const currency = getCurrency(value);
      const description = cleanString($(element).find('.ListingCell-shortDescription a').text());
      const images = [$(element).find('.ListingCell-image img').data('src')];
      const url = $(element).find('.js-listing-link').attr('href');
      const address = cleanString($(element).find('.ListingCell-KeyInfo-address .js-listing-link').text());
      const city = 'tijuana';
      const { source } = this;

      const place = {
        price,
        currency,
        description,
        images,
        url,
        address,
        city,
        source,
      };

      return place;
    });
  }
}

module.exports = Lamudi;

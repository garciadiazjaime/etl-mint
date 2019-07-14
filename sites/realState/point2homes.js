/* eslint class-methods-use-this: 0 */

const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const RealState = require('../../crawler/realState');
const { getPrice, getCurrency } = require('../../utils/currency');
const { cleanString } = require('../../utils/string');


class Point2Homes extends RealState {
  constructor() {
    super();
    this.site = 'point2homes';
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
    const next = $('.pager li.next').length;
    return !!next;
  }

  async extract(url, pageNumber) {
    if (pageNumber > 1) {
      const selector = '.pager li.next a';
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

    return $('.listings .items .item-cnt').toArray().map((element) => {
      const value = $(element).find('.price').text();
      const price = getPrice(value);
      const currency = getCurrency(value);
      const description = cleanString($(element).find('.item-info-cnt .characteristics-cnt').text().trim());
      const latitude = $(element).find('.inner-left input[name^="Latitude"]').val();
      const longitude = $(element).find('.inner-left input[name^="Longitude"]').val();
      const image = $(element).find('.photo-inner img').data('original');
      const url = domain + $(element).find('.photo-inner a').attr('href');
      const address = $(element).find('.inner-left input[name^="ShortAddress"]').val();
      const city = 'tijuana';
      const source = 'point2homes';

      const place = {
        price,
        currency,
        description,
        latitude,
        longitude,
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


module.exports = Point2Homes;

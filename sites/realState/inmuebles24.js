/* eslint class-methods-use-this: 0 */

const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const RealState = require('../../crawler/realState');
const { getPrice, getCurrency } = require('../../utils/currency');
const { cleanString } = require('../../utils/string');

function getImage($, element) {
  const image = $(element).find('.posting-gallery-slider .flickity-slider .is-selected img').attr('src');
  if (image) {
    return image;
  }

  const galleryHTML = $(element).find('.posting-gallery-slider').html();
  const images = galleryHTML.match(/https:\/\/[\w\.\/]*/gi);

  return Array.isArray(images) ? images[0] : '';
}

class Lamudi extends RealState {
  constructor() {
    super();
    this.source = 'inmuebles24';
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
    const next = !!$('.paging .pag-go-next').length;
    return next;
  }

  async extract(url, pageNumber) {
    if (pageNumber > 1) {
      const selector = '.paging .pag-go-next';
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

    const places = $('.list-card-container > div .general-content').toArray().map((element) => {
      const value = $(element).find('.posting-price .first-price').text().trim();
      const price = getPrice(value);
      const currency = getCurrency(value);
      const description = cleanString($(element).find('.posting-description').text());
      const images = [getImage($, element)];
      const url = domain + $(element).find('.posting-title a').attr('href');
      const address = cleanString($(element).find('.posting-location').text());
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

    return places;
  }
}

module.exports = Lamudi;

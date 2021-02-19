const debug = require('debug')('app:like_post');

const { getBrowser } = require('../../utils/browser');
const { Post } = require('./models');

async function main(cookies) {
  const post = await Post.findOne({
    liked: { $exists: 0 },
    $or: [{ source: 'tijuanamakesmehungry' }, { source: 'tijuanafood' }],
  }).sort({ createdAt: -1 });

  const browser = await getBrowser();
  const page = await browser.newPage();

  if (Array.isArray(cookies) && cookies.length) {
    await page.setCookie(...cookies);
  }

  const response = await page.goto(post.permalink);
  debug(`${response.headers().status}:${post.permalink}`);

  if (response.headers().status !== '404') {
    await page.waitForSelector('button svg[aria-label="Like"]', { timeout: 1000 * 3 });

    await page.evaluate(() => document.querySelectorAll('button')[2].click());
  }

  post.liked = true;

  await browser.close();

  post.save();

  return debug(`liked:${post.id}`);
}

if (require.main === module) {
  main().then(() => {
    process.exit(0);
  });
}

module.exports = main;

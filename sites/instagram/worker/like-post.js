const debug = require('debug')('app:like_post');

const { getBrowser } = require('../../../utils/browser');

const { getPosts, updateInstagramPost } = require('../../../utils/mint-api');
const { getPostToLike } = require('../queries-mint-api');

async function main(cookies) {
  const query = getPostToLike();
  const data = await getPosts(query);

  if (!Array.isArray(data) || !data.length) {
    debug('no_post');
    return null;
  }

  const post = data[0];

  const browser = await getBrowser();
  const page = await browser.newPage();

  if (Array.isArray(cookies) && cookies.length) {
    await page.setCookie(...cookies);
  }

  debug(post.permalink);
  await page.goto(post.permalink);

  await page.waitForSelector('button svg[aria-label="Like"]', { timeout: 1000 * 3 });

  await page.evaluate(() => document.querySelectorAll('button')[2].click());

  await browser.close();

  const postUpdated = {
    ...post,
    liked: true,
  };

  const response = await updateInstagramPost(postUpdated);

  debug(response);

  return null;
}

if (require.main === module) {
  main().then(() => {
    process.exit(0);
  });
}

module.exports = main;

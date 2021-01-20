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

  const response = await page.goto(post.permalink);
  debug(post.permalink, response.headers().status);

  const postUpdated = {
    ...post,
  };

  if (response.headers().status === '404') {
    postUpdated.state = 'DELETED';
  } else {
    await page.waitForSelector('button svg[aria-label="Like"]', { timeout: 1000 * 3 });

    await page.evaluate(() => document.querySelectorAll('button')[2].click());

    postUpdated.liked = true;
  }

  await browser.close();

  const updateResponse = await updateInstagramPost(postUpdated);

  debug(updateResponse);

  return null;
}

if (require.main === module) {
  main().then(() => {
    process.exit(0);
  });
}

module.exports = main;

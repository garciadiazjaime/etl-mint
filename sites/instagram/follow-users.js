const mapSeries = require('async/mapSeries');

const debug = require('debug')('app:follow_user');

const { getBrowser } = require('../../utils/browser');
const { sendEmail } = require('../../utils/email');
const { Post } = require('./models');

const path = './public';

async function followUsers(page, post) {
  const userURL = `https://www.instagram.com/${post.user.username}/`;
  const response = await page.goto(userURL);

  debug(`${response.headers().status}:${userURL}`);

  if (response.headers().status !== '200') {
    await page.screenshot({ path: `${path}/following-error.png` });

    return sendEmail(`follow-error:${userURL}`);
  }

  await page.waitForSelector('section li a', { timeout: 1000 * 3 });

  await page.evaluate(() => document.querySelectorAll('section li a')[0].click()); // open followers
  await page.waitForSelector('.PZuss button', { timeout: 1000 * 3 });

  const usersTotal = await page.evaluate(() => document.querySelectorAll('.PZuss button').length);
  const users = Array.apply(null, Array(usersTotal)).map((x, i) => i);

  await mapSeries(users, async (index) => {
    await page.evaluate(i => document.querySelectorAll('.PZuss button')[i].click(), index);
    await page.waitFor(1000);
  });

  await page.screenshot({ path: `${path}/following-after.png` });

  return debug(`follow:${usersTotal}`);
}

async function main(cookies) {
  const post = await Post.findOne({
    following: { $exists: 0 },
    $or: [{ source: 'tijuanamakesmehungry' }, { source: 'tijuanafood' }],
  }).sort({ createdAt: -1 });

  const browser = await getBrowser();
  const page = await browser.newPage();

  if (Array.isArray(cookies) && cookies.length) {
    await page.setCookie(...cookies);
  }

  await followUsers(page, post);

  post.following = true;

  await post.save();

  await browser.close();

  return debug(`following:${post.id}`);
}

if (require.main === module) {
  main().then(() => {
    process.exit(0);
  });
}

module.exports = main;

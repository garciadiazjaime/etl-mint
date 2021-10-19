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

  const html = await page.content();
  if (html.includes('This Account is Private')) {
    debug(`account_private:${post.user.username}`);

    await page.screenshot({ path: `${path}/following-error.png` });

    return null;
  }

  await page.waitForSelector('section li a', { timeout: 1000 * 3 });

  await page.evaluate(() => document.querySelectorAll('section li a')[0].click()); // open followers
  await page.waitForSelector('.PZuss button', { timeout: 1000 * 3 });

  await page.evaluate(() => {
    document.querySelector('.isgrP').scrollTop = 300;
  });

  const usersTotal = await page.evaluate(() => document.querySelectorAll('.PZuss button').length);
  const users = Array.apply(null, Array(usersTotal)).map((x, i) => i);

  debug(`usersTotal:${usersTotal}`);

  await mapSeries(users, async (index) => {
    await page.evaluate((i) => {
      if (document.querySelectorAll('.PZuss button')[i] && document.querySelectorAll('.PZuss button')[i].classList.contains('y3zKF')) {
        document.querySelectorAll('.PZuss button')[i].click();
      }
    }, index);
    await page.waitFor(1000);
    await page.screenshot({ path: `${path}/following-after-${index}.png` });
  });

  await page.waitFor(1000);

  await page.screenshot({ path: `${path}/following-after.png` });

  debug('done-following');

  return null;
}

async function main(cookies) {
  const post = await Post.aggregate([
    {
      $match: {
        following: { $exists: 0 },
        $or: [
          {
            source: 'tijuanamakesmehungry',
          },
          {
            source: 'tijuanafood',
          },
        ],
        mediaType: {
          $nin: ['GraphVideo', 'GraphSidecar'],
        },
        $or: [
          {
            labels: {
              $elemMatch: {
                name: 'Food',
              },
            },
          },
          {
            labels: {
              $elemMatch: {
                name: 'Beverage',
              },
            },
          },
        ],
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $limit: 1,
    },
  ]);

  const browser = await getBrowser();
  const page = await browser.newPage();

  if (Array.isArray(cookies) && cookies.length) {
    await page.setCookie(...cookies);
  }

  if (!post) {
    debug('POST_ERROR', post);
    await page.screenshot({ path: `${path}/followuser-01.png` });
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

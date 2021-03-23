const fs = require('fs');
const mapSeries = require('async/mapSeries');

const debug = require('debug')('app:like_post');

const { getBrowser } = require('../../utils/browser');
const { Post } = require('./models');

const captions = [
  'wow',
  'yes',
  'nice',
  'yumi',
  'deli',
  'justo',
  'bravo',
  'delish',
  'vientos',
  'es todo',
  'correcto',
  'provecho',
  'perfecto',
  'muy bien',
  'favorito',
  'que bien',
  'que rico',
  'sigan así',
  'algo bien',
  'exquisito',
  'muy buena',
  'excelente',
  'buena foto',
  'super bien',
  'bien dicho',
  'bien hecho',
  'super bien',
  'son únicos',
  'es correcto',
  'buen trabajo',
  'buen servicio',
  'mejor difícil',
  'por excelencia',
  'que bien se ve',
  'se ve muy bien',
  'justo y necesario',
  'excelente trabajo',
  'excelente calidad',
  'excelente servicio',
  'excelente contenido',
  'difícil ponerlo mejor',
];
const path = './public';

async function likeAndCommentPost(page, post) {
  const response = await page.goto(post.permalink);
  debug(`${response.headers().status}:${post.permalink}`);

  if (response.headers().status === '404') {
    return null;
  }

  await page.waitForSelector('button svg[aria-label="Like"]', { timeout: 1000 * 3 });

  const index = parseInt(Math.random() * captions.length, 10);

  await page.evaluate((caption) => {
    const emojiButton = document.querySelector('button svg[aria-label="Emoji"]');

    if (!emojiButton) {
      return debug('EMOJI_NOT_FOUND');
    }

    emojiButton.parentNode.click();
    document.querySelectorAll('._7UhW9.xLCgt.qyrsm._0PwGv.uL8Hv')[1].parentNode.nextSibling.click();
    document.querySelector('button svg[aria-label="Emoji"]').parentNode.click();

    document.querySelector('button svg[aria-label="Like"]').parentNode.click();

    const input = document.querySelector('textarea');
    const lastValue = input.value;
    input.value += `  ${caption}`;
    const event = new Event('input', { bubbles: true });
    event.simulated = true;
    const tracker = input._valueTracker;
    tracker.setValue(lastValue);
    input.dispatchEvent(event);

    document.querySelector('form [type="submit"]').click();

    return null;
  }, captions[index]);

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }

  // page.screenshot({ path: `${path}/like.png` });
  return null;
}

async function followUsers(page, post) {
  const userURL = `https://www.instagram.com/${post.user.username}/`;
  const response = await page.goto(userURL);
  debug(`${response.headers().status}:${userURL}`);
  if (response.headers().status === '404') {
    return null;
  }

  await page.waitForSelector('section li a', { timeout: 1000 * 3 });

  await page.evaluate(() => document.querySelectorAll('section li a')[0].click());
  await page.waitForSelector('.PZuss button', { timeout: 1000 * 3 });

  const usersTotal = await page.evaluate(() => document.querySelectorAll('.PZuss button').length);
  const users = Array.apply(null, Array(usersTotal)).map((x, i) => i);

  // await page.screenshot({ path: `${path}/follow_before.png` });

  await mapSeries(users, async (index) => {
    await page.evaluate(i => document.querySelectorAll('.PZuss button')[i].click(), index);
    await page.waitFor(1000);
  });

  // return page.screenshot({ path: `${path}/follow_after.png` });
  return null;
}

async function main(cookies) {
  const post = await Post.findOne({
    liked: { $exists: 0 },
    $or: [{ source: 'tijuanamakesmehungry' }, { source: 'tijuanafood' }],
  }).sort({ createdAt: -1 });

  const browser = await getBrowser();
  const page = await browser.newPage();

  // page.on('console', message => console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
  //   .on('pageerror', ({ message }) => console.log(message))
  //   .on('response', response => console.log(`${response.status()} ${response.url()}`))
  //   .on('requestfailed', request => console.log(`${request.failure().errorText} ${request.url()}`));

  if (Array.isArray(cookies) && cookies.length) {
    await page.setCookie(...cookies);
  }

  await likeAndCommentPost(page, post);

  post.liked = true;
  await post.save();

  await followUsers(page, post);

  await browser.close();

  return debug(`liked:${post.id}`);
}

if (require.main === module) {
  main().then(() => {
    process.exit(0);
  });
}

module.exports = main;
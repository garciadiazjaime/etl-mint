const fs = require('fs');
const mapSeries = require('async/mapSeries');

const debug = require('debug')('app:like_post');

const { getBrowser } = require('../../utils/browser');
const { sendEmail } = require('../../utils/email');
const { Post } = require('./models');

const captions = [
  'wow',
  'yes',
  'nice',
  'yumi',
  'deli',
  'bien',
  'justo',
  'bravo',
  'único',
  'fácil',
  'delish',
  'vientos',
  'soy fan',
  'es todo',
  'correcto',
  'provecho',
  'perfecto',
  'muy bien',
  'favorito',
  'que bien',
  'que rico',
  'sigan así',
  'que lindo',
  'algo bien',
  'exquisito',
  'muy buena',
  'excelente',
  'buen feed',
  'buena foto',
  'super bien',
  'bien dicho',
  'bien hecho',
  'super bien',
  'son únicos',
  'es correcto',
  'a la medida',
  'salió buena',
  'recomendado',
  'buen trabajo',
  'buen servicio',
  'mejor difícil',
  'que bien salió',
  'por excelencia',
  'que bien se ve',
  'se ve muy bien',
  'excelente feed',
  'excelente foto',
  'justo y necesario',
  'excelente trabajo',
  'excelente calidad',
  'excelente servicio',
  'excelente contenido',
  'difícil ponerlo mejor',
];
let captionIndex = 12;
const path = './public';

async function likeAndCommentPost(page, post) {
  const response = await page.goto(post.permalink);
  debug(`${response.headers().status}:${post.permalink}`);

  if (response.headers().status !== '200') {
    await page.screenshot({ path: `${path}/like-error.png` });

    return null;
  }

  try {
    await page.waitForSelector('button svg[aria-label="Comment"]', { timeout: 1000 * 3 });
  } catch (error) {
    await sendEmail(`NO_COMMENT:${post.permalink}`);
    debug('NO_COMMENT');
    return debug(error);
  }

  const index = captionIndex % captions.length;
  debug(`caption:${index}`);
  captionIndex += 1;

  const result = await page.evaluate((caption) => {
    const emojiButton = document.querySelector('button svg[aria-label="Emoji"]');

    if (!emojiButton) {
      return 'EMOJI_NOT_FOUND';
    }

    // document.querySelector('button svg[aria-label="Like"]').parentNode.click(); // like post

    // comment post, first enable textarea then add caption
    emojiButton.parentNode.click(); // open emoji list
    document.querySelectorAll('._7UhW9.xLCgt.qyrsm._0PwGv.uL8Hv')[1].parentNode.nextSibling.click(); // click first emoji
    emojiButton.parentNode.click(); // close emoji list

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

  if (result) {
    debug(result);
  }

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


  if (response.headers().status !== '200') {
    await page.screenshot({ path: `${path}/follow-error.png` });

    await sendEmail(`follow-error:${userURL}`);

    return null;
  }

  await page.waitForSelector('section li a', { timeout: 1000 * 3 });

  await page.evaluate(() => document.querySelectorAll('section li a')[0].click()); // open followers
  await page.waitForSelector('.PZuss button', { timeout: 1000 * 3 });

  const usersTotal = await page.evaluate(() => document.querySelectorAll('.PZuss button').length);
  const users = Array.apply(null, Array(usersTotal)).map((x, i) => i);

  // await page.screenshot({ path: `${path}/follow_before.png` });

  await mapSeries(users, async (index) => {
    await page.evaluate(i => document.querySelectorAll('.PZuss button')[i].click(), index);
    await page.waitFor(1000);
  });
  debug(`follow:${usersTotal}`);

  // await page.screenshot({ path: `${path}/follow_after.png` });

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

  // await likeAndCommentPost(page, post);

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

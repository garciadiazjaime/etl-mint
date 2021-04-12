const fs = require('fs');

const debug = require('debug')('app:comment_post');

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
let captionIndex = 18;
const path = './public';

async function commentPost(page, post) {
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

  return null;
}

async function main(cookies) {
  const post = await Post.findOne({
    commented: { $exists: 0 },
    $or: [{ source: 'tijuanamakesmehungry' }, { source: 'tijuanafood' }],
  }).sort({ createdAt: -1 });

  const browser = await getBrowser();
  const page = await browser.newPage();

  if (Array.isArray(cookies) && cookies.length) {
    await page.setCookie(...cookies);
  }

  await commentPost(page, post);

  post.commented = true;

  await post.save();

  await browser.close();

  return debug(`liked:${post.id}`);
}

if (require.main === module) {
  main().then(() => {
    process.exit(0);
  });
}

module.exports = main;

const fs = require('fs');

const debug = require('debug')('app:like_post');

const { getBrowser } = require('../../utils/browser');
const { Post } = require('./models');

const captions = [
  'wow',
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
  'que bien',
  'que rico',
  'sigan así',
  'algo bien',
  'exquisito',
  'muy buena',
  'excelente',
  'buena foto',
  'bien hecho',
  'super bien',
  'es correcto',
  'buen trabajo',
  'buen servicio',
  'por excelencia',
  'que bien se ve',
  'se ve muy bien',
  'excelente calidad',
  'excelente contenido',
];

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

  const response = await page.goto(post.permalink);
  debug(`${response.headers().status}:${post.permalink}`);

  if (response.headers().status !== '404') {
    await page.waitForSelector('button svg[aria-label="Like"]', { timeout: 1000 * 3 });

    const index = parseInt(Math.random() * captions.length, 10);

    await page.evaluate((caption) => {
      document.querySelector('button svg[aria-label="Emoji"]').parentNode.click();
      document.querySelectorAll('._7UhW9.xLCgt.qyrsm._0PwGv.uL8Hv')[1].parentNode.nextSibling.click();
      document.querySelector('button svg[aria-label="Emoji"]').parentNode.click();

      document.querySelector('button svg[aria-label="Like"]').parentNode.click();

      const input = document.querySelector('textarea');
      const lastValue = input.value;
      input.value += ` ${caption}`;
      const event = new Event('input', { bubbles: true });
      event.simulated = true;
      const tracker = input._valueTracker;
      tracker.setValue(lastValue);
      input.dispatchEvent(event);

      document.querySelector('form [type="submit"]').click();
    }, captions[index]);
  }

  const path = './public';
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  await page.screenshot({ path: `${path}/like.png` });

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

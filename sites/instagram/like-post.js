const debug = require('debug')('app:like_post');

const { getBrowser } = require('../../utils/browser');
const { Post } = require('./models');

const captions = [
  'buena foto',
  'muy bien',
  'bien hecho',
  'buen trabajo',
  'excelente calidad',
  'wow',
  'justo',
  'que bien',
  'es todo',
  'excelente contenido',
  'muy buena',
  'se ve muy bien',
  'por excelencia',
  'perfecto',
  'sigan así',
  'excelente',
  'yumi',
  'exquisito',
  'bravo',
  'provecho',
  'vientos',
  'algo bien',
  'correcto',
  'es correcto',
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
      document.querySelectorAll('button')[24].click();
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

  await page.screenshot({ path: './public/like.png' });

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

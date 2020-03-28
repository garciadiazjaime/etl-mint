const debug = require('debug')('app:main');
const queue = require('async/queue');
const cron = require('node-cron');

const realState = require('./sites/realState');
const instagramTijuana = require('./sites/instagram/tijuana');

function setQueue(etl, items) {
  const q = queue(async () => {
    items.map(async (item) => {
      await etl(item);
    });
  });

  q.error((err, task) => {
    debug('ERROR', err, task);
  });

  q.push(etl);
}

cron.schedule('6 * * * *', async () => {
  debug('instagram');
  await instagramTijuana();
});

cron.schedule('42 * * * *', async () => {
  debug('realstate');
  const sites = ['baja123', 'century21global', 'inmuebles24', 'lamudi', 'point2homes', 'propiedades', 'vivanuncios'];
  setQueue(realState, sites);
});

const debug = require('debug')('app:main');
const queue = require('async/queue');

const Century21Global = require('./sites/realState/century21global');
const Point2Homes = require('./sites/realState/point2homes');
const Baja123 = require('./sites/realState/baja123');
const Propiedades = require('./sites/realState/propiedades');
const Lamudi = require('./sites/realState/lamudi');
const Vivanuncios = require('./sites/realState/vivanuncios');
const Inmuebles24 = require('./sites/realState/inmuebles24');

function main() {
  const q = queue(async (Etl) => {
    const crawler = new Etl();
    await crawler.main();
  });

  q.error((err, task) => {
    debug('ERROR', err, task);
  });

  q.push(Century21Global);

  q.push(Point2Homes);

  q.push(Baja123);

  q.push(Propiedades);

  q.push(Lamudi);

  q.push(Vivanuncios);

  q.push(Inmuebles24);
}

main();

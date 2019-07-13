const debug = require('debug')('app:main');
const queue = require('async/queue');

const Century21Global = require('./sites/century21global');
const Point2Homes = require('./sites/point2homes');
const baja123 = require('./sites/baja123');
const propiedades = require('./sites/propiedades');

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

  q.push(baja123);

  q.push(propiedades);
}

main();

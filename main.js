const debug = require('debug')('app:main');
const queue = require('async/queue');

const century21global = require('./sites/century21global');
const point2homes = require('./sites/point2homes');
const baja123 = require('./sites/baja123');
const propiedades = require('./sites/propiedades');

function main() {
  const q = queue(async (etl) => {
    await etl();
  });

  q.error((err, task) => {
    debug('ERROR', err, task);
  });

  q.push(century21global);

  q.push(point2homes);

  q.push(baja123);

  q.push(propiedades);
}

main();

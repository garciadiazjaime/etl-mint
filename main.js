const debug = require('debug')('app:main')
const queue = require('async/queue')

const century21global = require('./sites/century21global')
const point2homes = require('./sites/point2homes')

function main() {
  const q = queue(async(etl) => {
    await etl();
  });

  q.error((err, task) => {
    debug('task experienced an error', err, task);
  });

  q.push(century21global);

  q.push(point2homes)
}

main()

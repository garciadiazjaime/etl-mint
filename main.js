const debug = require('debug')('app:main')
const queue = require('async/queue')

const century21global = require('./sites/century21global')

function main() {
  const q = queue((task, callback) => {
    callback();
  });

  q.error((err, task) => {
    debug('task experienced an error', err, task);
  });

  q.push('', (err) => {
    century21global()
  });
}

main()

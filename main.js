const mapSeries = require('async/mapSeries');
const cron = require('node-cron');

const realState = require('./sites/realState');
const { getRealStateSites } = require('./sites/realState');


function main() {
  const sites = getRealStateSites();

  cron.schedule('42 */4 * * *', async () => {
    await mapSeries(sites, realState);
  });
}

main();

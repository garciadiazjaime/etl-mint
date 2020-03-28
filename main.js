const debug = require('debug')('app:main');
const mapSeries = require('async/mapSeries');
const cron = require('node-cron');

const realState = require('./sites/realState');
const instagramTijuana = require('./sites/instagram/tijuana');
const config = require('./config');


function main() {
  const sites = config.get('sites');
  const enableSites = Object.keys(sites).filter(key => sites[key].active);


  cron.schedule('6 * * * *', async () => {
    debug('instagram');
    await instagramTijuana();
  });

  cron.schedule('42 * * * *', async () => {
    debug('realstate');
    mapSeries(enableSites, realState);
  });
}

main();

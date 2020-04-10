const mapSeries = require('async/mapSeries');
const cron = require('node-cron');

const realState = require('./sites/realState');
const { getRealStateSites } = require('./sites/realState');
const instagramPosts = require('./sites/instagram/posts');
const instagramBrand = require('./sites/instagram/brand');
const instagramMeta = require('./sites/instagram/meta');


function main() {
  const sites = getRealStateSites();

  cron.schedule('6 * * * *', async () => {
    await instagramPosts();
  });
  cron.schedule('*/5 * * * *', async () => {
    await instagramBrand();
  });
  cron.schedule('0 */2 * * *', async () => {
    await instagramMeta();
  });

  cron.schedule('42 */4 * * *', async () => {
    await mapSeries(sites, realState);
  });
}

main();

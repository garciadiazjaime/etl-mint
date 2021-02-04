const fetch = require('node-fetch');
const debug = require('debug')('app:netlify');

const config = require('../../config');

async function main() {
  const postConfig = {
    method: 'POST',
  };

  const sites = config.get('netlify.hook').split(',');

  const promises = sites.map((site) => {
    debug(site);

    return fetch(site, postConfig);
  });

  await Promise.all(promises);
}

if (require.main === module) {
  main().then(() => {
    process.exit(0);
  });
}

module.exports = main;

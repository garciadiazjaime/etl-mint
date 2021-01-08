const fetch = require('node-fetch');

const config = require('../../config');

async function main() {
  const postConfig = {
    method: 'POST',
  };

  await fetch(config.get('netlify.hook'), postConfig);
}

if (require.main === module) {
  main().then(() => {
    process.exit(0);
  });
}

module.exports = main;

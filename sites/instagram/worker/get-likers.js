const fs = require('fs');

const login = require('./login');
const extract = require('../../../utils/extract');
const config = require('../../../config');

async function getHTML() {
  if (config.get('env') !== 'production') {
    return fs.readFileSync('./stubs/instagram-post-likers.html', 'utf8');
  }

  const cookies = await login();

  const url = 'https://www.instagram.com/graphql/query/?query_hash=d5d763b1e2acf209d62d22d184488e57&variables=%7B%22shortcode%22%3A%22CJCuZ8xHbJP%22%2C%22include_reel%22%3Atrue%2C%22first%22%3A24%7D';
  const source = 'likers';

  const response = await extract(url, source, cookies);

  return response;
}

async function main() {
  const html = await getHTML();

  console.log(html);
}


if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

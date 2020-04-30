const debug = require('debug')('app:instagram:sche:indx');
const { promisify } = require('util');
const { readFile, unlinkSync, createWriteStream } = require('fs');
const fetch = require('node-fetch');
const { IgApiClient } = require('instagram-private-api');

const streamPipeline = promisify(require('stream').pipeline);

const readFilePromise = promisify(readFile);

const config = require('../../../config');

const ig = new IgApiClient();
const imageName = 'post.jpg';

async function restoreSession() {
  const {
    cookies,
    state,
  } = JSON.parse(Buffer.from(config.get('instagram.session'), 'base64').toString('ascii'));

  await ig.state.deserializeCookieJar(cookies);
  ig.state.deviceString = state.deviceString;
  ig.state.deviceId = state.deviceId;
  ig.state.uuid = state.uuid;
  ig.state.phoneId = state.phoneId;
  ig.state.adid = state.adid;
  ig.state.build = state.build;
}

function downloadImage() {
  const url = 'https://scontent-sjc3-1.xx.fbcdn.net/v/t51.2885-15/95097353_2607363599526616_649658401352137388_n.jpg?_nc_cat=106&_nc_sid=8ae9d6&_nc_oc=AQmv_wY4R5_e9vyH4UGkaKM-v3XWtZlAqikGKQS50V9pPK044ScVyUk-t9c62D7EK-E&_nc_ht=scontent-sjc3-1.xx&oh=309d4ac232937e2e3a26b47f4acb3a9b&oe=5ED105C3';

  return fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`unexpected response ${res.statusText}`);
      }

      return streamPipeline(res.body, createWriteStream(imageName));
    });
}

async function postImage() {
  const imageUrl = 'post.jpg';
  const file = await readFilePromise(imageUrl);
  const caption = 'caption cool';

  await ig.publish.photo({
    file,
    caption,
  });
}

async function main() {
  await restoreSession();
  debug('session open');

  await downloadImage();
  debug('image downloaded');

  await postImage();
  debug('post created');

  await unlinkSync(imageName);
}

main();

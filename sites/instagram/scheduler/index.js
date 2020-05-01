const debug = require('debug')('app:instagram:sche:indx');
const { promisify } = require('util');
const { readFile, unlinkSync, createWriteStream } = require('fs');
const fetch = require('node-fetch');
const { IgApiClient } = require('instagram-private-api');

const streamPipeline = promisify(require('stream').pipeline);

const readFilePromise = promisify(readFile);

const { getPosts, savePost } = require('../../../utils/mint-api');
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

function downloadImage(post) {
  return fetch(post.mediaUrl)
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

function getMediaUrl(post) {
  if (post.mediaUrl) {
    return post.mediaUrl;
  }

  if (Array.isArray(post.children) && post.children.length) {
    return post.children[0].media_url;
  }

  return '';
}

function getPost(posts) {
  if (!Array.isArray(posts) || !posts.length) {
    return false;
  }

  const mediaUrl = getMediaUrl(posts[0]);

  if (!mediaUrl) {
    return false;
  }

  const post = {
    mediaUrl,
  };

  return post;
}

function updatePostState(data) {
  const post = data[0];
  post.published = true;

  return savePost(post);
}

async function main() {
  const data = await getPosts({ published: false });

  const item = getPost(data);

  if (!item) {
    return debug('nothing to post');
  }

  await restoreSession();
  debug('session open');

  await downloadImage(item);
  debug('image downloaded');

  await postImage();
  debug(`post published:${data[0].id}`);

  await updatePostState(data);
  debug(`post updated:${data[0].id}`);

  unlinkSync(imageName);

  return null;
}

if (require.main === module) {
  main();
}

module.exports = main;

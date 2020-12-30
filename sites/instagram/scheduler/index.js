const debug = require('debug')('app:instagram:sche:indx');
const { promisify } = require('util');
const { readFile, unlinkSync, createWriteStream } = require('fs');
const fetch = require('node-fetch');
const { IgApiClient } = require('instagram-private-api');

const streamPipeline = promisify(require('stream').pipeline);

const readFilePromise = promisify(readFile);

const { getPosts, createInstagramPost } = require('../../../utils/mint-api');
const { getPostToPublish } = require('../queries-mint-api');
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

async function postImage(post) {
  const imageUrl = 'post.jpg';
  const file = await readFilePromise(imageUrl);
  const { caption } = post;

  await ig.publish.photo({
    file,
    caption,
  });

  // await ig.publish.story({
  //   file,
  //   caption,
  // });
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

function getCaption(post) {
  const response = [];
  const { user } = post;

  if (user && user.username) {
    response.push(`@${user.username}`);
  }

  return response.filter(item => item).join(' ');
}

function getPost(posts) {
  if (!Array.isArray(posts) || !posts.length) {
    return false;
  }
  const postRecord = posts[0];

  const mediaUrl = getMediaUrl(postRecord);

  if (!mediaUrl) {
    return false;
  }

  const post = {
    mediaUrl,
    caption: getCaption(postRecord),
  };

  return post;
}

function updatePostState(post) {
  const postUpdated = {
    id: post.id,
    published: true,
  };


  return createInstagramPost(postUpdated);
}

async function main() {
  const query = getPostToPublish();
  const data = await getPosts(query);

  const instagramPost = getPost(data);

  if (!instagramPost) {
    return debug('nothing to post');
  }

  await restoreSession();
  debug(`caption: ${JSON.stringify(instagramPost.caption)}`);

  await downloadImage(instagramPost);
  debug('image downloaded');

  await postImage(instagramPost);
  debug(`post published:${data[0].id}`);

  await updatePostState(data[0]);
  debug(`post updated:${data[0].id}`);

  unlinkSync(imageName);

  return null;
}

if (require.main === module) {
  main();
}

module.exports = main;

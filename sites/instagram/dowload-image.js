const { promisify } = require('util');
const { createWriteStream } = require('fs');

const streamPipeline = promisify(require('stream').pipeline);
const fetch = require('node-fetch');

const imageName = 'post.jpg';

async function downloadImage(mediaUrl) {
  return fetch(mediaUrl)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`unexpected response ${res.statusText}`);
      }

      return streamPipeline(res.body, createWriteStream(imageName));
    });
}

async function main() {
  const url = 'https://scontent-ort2-1.cdninstagram.com/v/t51.2885-15/e15/s640x640/179686247_510302206672136_3099911534448586063_n.jpg?tp=1&_nc_ht=scontent-ort2-1.cdninstagram.com&_nc_cat=108&_nc_ohc=ogZiMTTtAGkAX8Bl4xF&edm=ALY_pVYBAAAA&ccb=7-4&oh=00bf7275d284a7753a52f8c2144e0bae&oe=60ADB289&_nc_sid=1ffb93';
  await downloadImage(url);
}

main();

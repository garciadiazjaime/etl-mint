const fetch = require('node-fetch');

const config = require('../config');

const apiUrl = config.get('api.url');

async function getPosts(limit = 1) {
  const payload = {
    query: `query Post {
      posts(first:${limit}) {
        _id
        permalink
        mediaType
        mediaUrl
        caption
        children {
          media_url
        }
      }
    }`,
  };

  const result = await fetch(`${apiUrl}/instagram/graphiql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const {
    data: { posts },
  } = await result.json();

  return posts;
}

async function getBrands(limit = 1) {
  const payload = {
    query: `{
      brands(first:${limit}) {
        _id
        post {
          mediaType
          mediaUrl
          caption
          children {
            media_url
          }
        }
        phones
        options
      }
    }`,
  };

  const result = await fetch(`${apiUrl}/instagram/graphiql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const {
    data: { brands },
  } = await result.json();

  return brands;
}

module.exports = {
  getPosts,
  getBrands,
};

const fetch = require('node-fetch');

const config = require('../config');

const apiUrl = config.get('api.url');

async function getPosts(limit = 1, state = 'CREATED') {
  const payload = {
    query: `{
      posts(first:${limit}, state:"${state}") {
        _id
        commentsCount
        permalink
        mediaType
        mediaUrl
        caption
        id
        likeCount
        children {
          media_type
          media_url
          caption
        }
        city
        source
        state
        brandId
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

async function getBrands(limit = 1, state = 'CREATED') {
  const payload = {
    query: `{
      brands(first:${limit}, state:"${state}") {
        _id
        id
        username
        fullName
        profilePicture
        post {
          _id
          commentsCount
          permalink
          mediaType
          mediaUrl
          caption
          id
          likeCount
          children {
            media_type
            media_url
            caption
          }
          city
          source
          state
          brandId
        }
        location {
          id
          name
          slug
          latitude
          longitude
          address {
            street
            zipCode
            city
            country
          }
        }
        options
        phones
        rank
        state
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

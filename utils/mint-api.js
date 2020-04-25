const { postRequest } = require('./fetch');
const config = require('../config');

const apiUrl = config.get('api.url');

async function getPosts(limit = 1, state = 'MAPPED') {
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

  const {
    data: { posts },
  } = await postRequest(`${apiUrl}/instagram/graphiql`, payload);

  return posts;
}

async function getLocation(id = '', slug = '') {
  const payload = {
    query: `{
      location(id:${id}, slug:"${slug}") {
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
    }`,
  };

  const {
    data: { location },
  } = await postRequest(`${apiUrl}/instagram/graphiql`, payload);

  return location;
}

function savePost(post) {
  return postRequest(`${apiUrl}/instagram/post`, post);
}

module.exports = {
  getPosts,
  getLocation,
  savePost,
};

const { postRequest } = require('./fetch');
const config = require('../config');

const apiUrl = config.get('api.url');

async function getPosts({
  limit = 1, state = 'MAPPED', published = null, id = '', locationState = '',
} = {}) {
  const payload = {
    query: `{
      posts(first:${limit}, state:"${state}", published:${published}, id:"${id}", locationState:"${locationState}") {
        _id
        id
        mediaType
        mediaUrl
        children {
          id
          media_type
          media_url
          caption
        }
        user {
          id
          username
          fullName
          profilePicture
        }
        location {
          id
          name
          slug
          location {
            type
            coordinates
          }
          state
          address {
            street
            zipCode
            city
            country
          }
        }
        meta {
          options
          phones
          rank
        }
      }
    }`,
  };

  const {
    data: { posts },
  } = await postRequest(`${apiUrl}/instagram/graphiql`, payload);

  return posts;
}

async function getLocation({ id = '', slug = '', state = '' }) {
  const payload = {
    query: `{
      location(id:"${id}", slug:"${slug}", state:"${state}") {
        id
        name
        slug
        state
        location {
          type
          coordinates
        }
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

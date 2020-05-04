const { postRequest } = require('./fetch');
const config = require('../config');

const apiUrl = config.get('api.url');

async function getPosts({
  limit = 1, state = 'MAPPED', published = null, id = '', locationStatate = '',
} = {}) {
  const payload = {
    query: `{
      posts(first:${limit}, state:"${state}", published:${published}, id:"${id}", locationStatate:"${locationStatate}") {
        _id
        id
        mediaType
        mediaUrl
        children {
          media_type
          media_url
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
          latitude
          longitude
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

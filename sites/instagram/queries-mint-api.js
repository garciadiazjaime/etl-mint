function getPostID(id) {
  return `{
    posts(id:"${id}") {
      _id
    }
  }`;
}

function getPostsWithLocationRaw(limit = 20) {
  return `{
    posts(first:${limit}, locationState:"RAW") {
      permalink
      id
      location {
        id
        name
        slug
        location {
          type
          coordinates
        }
        address {
          _id
          street
          zipCode
          city
          country
        }
        state
      }
    }
  }`;
}

function getPostsMeta(limit = 100) {
  return `{
    posts(first:${limit}, state:"MAPPED") {
      id
      caption
      meta {
        _id
      }
      location {
        address {
          street
        }
      }
    }
  }`;
}

function getPostToVerify(lastCheck, limit = 20) {
  return `{
    posts(first:${limit}, lastCheck:"${lastCheck}", state: "MAPPED") {
      id
      permalink
    }
  }`;
}

function getPostToUpdateMedia(postUpdate, limit = 20) {
  return `{
    posts(first:${limit}, postUpdate:"${postUpdate}", state: "MAPPED") {
      id
      permalink
    }
  }`;
}

function getLocationsMappedByID(id) {
  return `{
    locations(id:"${id}", state:"MAPPED") {
      id
      name
      slug
      location {
        type
        coordinates
      }
      address {
        _id
        street
        zipCode
        city
        country
      }
      state
    }
  }`;
}

module.exports = {
  getPostID,
  getPostsWithLocationRaw,
  getLocationsMappedByID,
  getPostsMeta,
  getPostToVerify,
  getPostToUpdateMedia,
};

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
        _id
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
};

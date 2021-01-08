function getPostID(id) {
  return `{
    posts(id:"${id}") {
      _id
    }
  }`;
}

function getUnmappedPosts(limit = 20) {
  return `{
    posts(first:${limit}, state:"RAW") {
      permalink
      id
      mediaType
      caption
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

function getPostToUpdateMedia(limit = 20) {
  return `{
    posts(first:${limit}, invalidImage:true, state: "MAPPED") {
      id
      permalink
    }
  }`;
}

function getPostWithoutLocation(limit = 50) {
  return `{
    posts(first:${limit}, state: "MAPPED", hasLocation: false) {
      id
      user {
        id
      }
    }
  }`;
}

function getPostsWithoutPhones(limit = 50) {
  return `{
    posts(first:${limit}, state: "MAPPED", hasPhone: false) {
      id
      user {
        id
      }
      meta {
        options
        phones
        rank
      }
    }
  }`;
}

function getPostsFromUserId(userId, limit = 30) {
  return `{
    posts(first:${limit}, state: "MAPPED", userId: "${userId}") {
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
          street
          zipCode
          city
          country
        }
        state
      }
      meta {
        phones
      }
    }
  }`;
}

function getPostToPublish() {
  return `{
    posts(first:1, state: "MAPPED", published: null) {
      id
      mediaUrl
      children {
        media_url
      }
      user {
        fullName
        username
      }
      location {
        name
        address {
          street
        }
      }
      meta {
        options
        phones
      }
      createdAt
    }
  }`;
}

function getLocationsByID(id) {
  return `{
    locations(id:"${id}") {
      id
      name
      slug
      gps {
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
  }`;
}

module.exports = {
  getPostID,
  getUnmappedPosts,
  getLocationsByID,
  getPostsMeta,
  getPostToVerify,
  getPostToUpdateMedia,
  getPostWithoutLocation,
  getPostsWithoutPhones,
  getPostsFromUserId,
  getPostToPublish,
};

const { postRequest } = require('./fetch');
const config = require('../config');

const apiUrl = config.get('api.url');

async function graphiqlHelper(query) {
  const payload = {
    query,
  };

  const {
    data,
  } = await postRequest(`${apiUrl}/graphiql`, payload);

  return data;
}

async function getPosts(query) {
  const { posts } = await graphiqlHelper(query);

  return posts;
}

async function getLocation(query) {
  const { locations } = await graphiqlHelper(query);

  return locations;
}

async function createInstagramPost(data) {
  if (!data) {
    return null;
  }

  const body = {
    query: `mutation MutationCreateInstagramPost($data: PostInput!) {
      createInstagramPost(data: $data) {
        id
      }
    }`,
    variables: {
      data,
    },
  };

  const response = await postRequest(`${apiUrl}/graphiql`, body);

  return response && response.data && response.data.createInstagramPost;
}

async function createInstagramLocation(data) {
  if (!data) {
    return null;
  }

  const body = {
    query: `mutation MutationCreateInstagramLocation($data: LocationInput!) {
      createInstagramLocation(data: $data) {
        id
      }
    }`,
    variables: {
      data,
    },
  };

  const response = await postRequest(`${apiUrl}/graphiql`, body);

  return response && response.data && response.data.createInstagramLocation;
}

async function createInstagramUser(data) {
  if (!data) {
    return null;
  }

  const body = {
    query: `mutation MutationCreateInstagramUser($data: UserInput!) {
      createInstagramUser(data: $data) {
        id
      }
    }`,
    variables: {
      data,
    },
  };

  const response = await postRequest(`${apiUrl}/graphiql`, body);

  return response && response.data && response.data.createInstagramUser;
}

function saveReport(report) {
  if (!Array.isArray(report) || !report.length) {
    return null;
  }

  const body = {
    query: `mutation Report($report: [PortInput]!) {
      addReport(report: $report) {
        _id
      }
    }`,
    variables: {
      report,
    },
  };

  return postRequest(`${apiUrl}/graphiql`, body);
}

function createRealState(data) {
  if (!Array.isArray(data) || !data.length) {
    return null;
  }

  const body = {
    query: `mutation CreatRealState($data: [RealStateInput]!) {
      createRealState(data: $data) {
        _id
      }
    }`,
    variables: {
      data,
    },
  };

  return postRequest(`${apiUrl}/graphiql`, body);
}

function createPolitician(data) {
  if (!data || !data.profileURL) {
    return null;
  }

  const body = {
    query: `mutation Add {
      addPolitician(
        name: "${data.name}", 
        party: "${data.party}", 
        partyImageURL: "${data.partyImageURL}",
        profileURL: "${data.profileURL}",
        pictureURL: "${data.pictureURL}", 
        type: "${data.type}", 
        state: "${data.state}", 
        circunscripcion: "${data.circunscripcion}", 
        district: ${data.district}, 
        email: "${data.email}", 
        startDate: "${data.startDate}",
        status: ${data.status},
        role: "${data.role}",
      )
    }`,
  };

  return postRequest(`${apiUrl}/graphiql`, body);
}

function updateInstagramPost(post) {
  if (!post || !post.id) {
    return null;
  }

  const body = {
    query: `mutation updateInstagramPost(
        $id: String,
        $permalink: String,
        $mediaUrl: String,
        $mediaType: String,
        $caption: String,
        $commentsCount: Int,
        $likeCount: Int,
        $city: String,
        $source: String,

        $state: String,
        $user: UserInputType,
        $location: LocationInputType,
        $meta: MetaInputType,
        $invalidImage: Boolean
      ) {
      updateInstagramPost(
        id: $id,

        permalink: $permalink,
        mediaUrl: $mediaUrl,
        mediaType: $mediaType,
        caption: $caption,
        commentsCount: $commentsCount,
        likeCount: $likeCount,
        city: $city,
        source: $source,

        state: $state,
        user: $user,
        location: $location,
        meta: $meta,
        invalidImage: $invalidImage
      )
    }`,
    variables: post,
  };

  return postRequest(`${apiUrl}/graphiql`, body);
}

async function updateInstagramUser(user) {
  if (!user || !user.id) {
    return null;
  }

  const body = {
    query: `mutation updateInstagramUser($id: String, $username: String, $fullName: String, $profilePicture: String, $followedBy: Int, $postsCount: Int) {
      updateInstagramUser(
        id: $id,
        username: $username
        fullName: $fullName,
        profilePicture: $profilePicture,
        followedBy: $followedBy,
        postsCount: $postsCount
      )
    }`,
    variables: user,
  };

  return postRequest(`${apiUrl}/graphiql`, body);
}

async function updateInstagramLocation(location) {
  if (!location || !location.id) {
    return null;
  }

  const body = {
    query: `mutation updateInstagramLocation($id: String, $name: String, $slug: String, $address: AddressInputType, $gps: GPSInputType) {
      updateInstagramLocation(
        id: $id,
        name: $name
        slug: $slug,
        address: $address,
        gps: $gps
      )
    }`,
    variables: location,
  };

  return postRequest(`${apiUrl}/graphiql`, body);
}

async function getPorts({
  limit = 1, since = '', to = '', name = '', type = null, entry = null,
}) {
  const payload = {
    query: `{
      port(first:${limit}, since: "${since}", to: "${to}", name: "${name}", type: ${type}, entry: ${entry}) {
        portId
        city
        name
        portStatus
        type
        entry
        updateTime
        status
        delay
        lanes
        uuid
        createdAt
      }
    }`,
  };

  const {
    data: { port },
  } = await postRequest(`${apiUrl}/graphiql`, payload);

  return port;
}

module.exports = {
  graphiqlHelper,
  getPosts,
  getLocation,
  createInstagramPost,
  createInstagramUser,
  createInstagramLocation,
  saveReport,
  getPorts,
  createRealState,
  createPolitician,
  updateInstagramPost,
  updateInstagramUser,
  updateInstagramLocation,
};

const { postRequest } = require('./fetch');
const config = require('../config');

const apiUrl = config.get('api.url');

async function getPosts(query) {
  const payload = {
    query,
  };

  const {
    data: { posts },
  } = await postRequest(`${apiUrl}/graphiql`, payload);

  return posts;
}

async function getLocation(query) {
  const payload = {
    query,
  };

  const {
    data: { location },
  } = await postRequest(`${apiUrl}/graphiql`, payload);

  return location;
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

  return response.data.createInstagramPost;
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
  getPosts,
  getLocation,
  createInstagramPost,
  saveReport,
  getPorts,
  createRealState,
};

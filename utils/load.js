const fetch = require('node-fetch');
const request = require('request-promise');

const config = require('../config');


function load(rawData, city, source) {
  const apiUrl = config.get('api.url');
  if (!Array.isArray(rawData) || !rawData.length) {
    return null;
  }

  const data = rawData.map(item => ({
    ...item,
    city,
    source,
  }));


  const options = {
    method: 'POST',
    uri: `${apiUrl}/real-state`,
    body: {
      data,
    },
    json: true,
  };

  return request(options);
}

async function loadAsync(apiUrl, body) {
  const postConfig = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    postConfig.body = JSON.stringify(body);
  }

  const result = await fetch(apiUrl, postConfig);
  const response = await result.json();

  return response;
}

module.exports = load;
module.exports.loadAsync = loadAsync;

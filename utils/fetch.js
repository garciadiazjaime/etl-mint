const fetch = require('node-fetch');

async function postRequest(apiUrl, payload) {
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (payload) {
    config.body = JSON.stringify(payload);
  }

  const result = await fetch(apiUrl, config);
  const response = await result.json();

  return response;
}

function getRequest(url) {
  return fetch(url);
}

module.exports.postRequest = postRequest;
module.exports.getRequest = getRequest;

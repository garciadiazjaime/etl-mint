const fetch = require('node-fetch');

const config = require('../config');

const secondsToWait = 1000 * (config.get('env') === 'production' ? 10 : 1);

async function postRequest(apiUrl, payload) {
  const postConfig = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (payload) {
    postConfig.body = JSON.stringify(payload);
  }

  const result = await fetch(apiUrl, postConfig);
  const response = await result.json();

  return response;
}

async function getRequest(url) {
  const response = await fetch(url);
  return response.json();
}

async function waiter() {
  return new Promise((resolve) => {
    setInterval(() => {
      resolve();
    }, secondsToWait);
  });
}

module.exports = {
  postRequest,
  getRequest,
  waiter,
};

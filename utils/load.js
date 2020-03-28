const request = require('request-promise');

const config = require('../config');

const apiUrl = config.get('api.url');

function load(data) {
  if (!Array.isArray(data) || !data.length) {
    return null;
  }

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

module.exports = load;

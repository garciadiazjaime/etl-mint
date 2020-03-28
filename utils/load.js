const request = require('request-promise');

const config = require('../config');

const apiUrl = config.get('api.url');

function load(rawData, city, source) {
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

module.exports = load;

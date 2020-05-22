const { getRequest } = require('./fetch');
const config = require('../config');

const apiUrl = config.get('gcenter.api.url');

async function getLast24hrsSummary() {
  return getRequest(`${apiUrl}/report/last-24hrs/summary?city=tijuana`);
}

module.exports = {
  getLast24hrsSummary,
};

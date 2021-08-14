const config = require('../../config');

async function restoreSession(igClient) {
  const {
    cookies,
    state,
  } = JSON.parse(Buffer.from(config.get('instagram.session'), 'base64').toString('ascii'));

  await igClient.state.deserializeCookieJar(cookies);
  igClient.state.deviceString = state.deviceString;
  igClient.state.deviceId = state.deviceId;
  igClient.state.uuid = state.uuid;
  igClient.state.phoneId = state.phoneId;
  igClient.state.adid = state.adid;
  igClient.state.build = state.build;
}

module.exports = {
  restoreSession,
};

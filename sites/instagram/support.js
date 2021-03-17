const config = require('../../config');

async function restoreSession(ig) {
  const {
    cookies,
    state,
  } = JSON.parse(Buffer.from(config.get('instagram.session'), 'base64').toString('ascii'));

  await ig.state.deserializeCookieJar(cookies);
  ig.state.deviceString = state.deviceString;
  ig.state.deviceId = state.deviceId;
  ig.state.uuid = state.uuid;
  ig.state.phoneId = state.phoneId;
  ig.state.adid = state.adid;
  ig.state.build = state.build;
}

module.exports = {
  restoreSession,
};

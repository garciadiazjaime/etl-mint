const debug = require('debug')('app:instagram:sche:code');
const { IgApiClient } = require('instagram-private-api');

const config = require('../../../config');

const taskConfig = {
  username: config.get('instagram.username'),
  code: config.get('instagram.code'),
};


const ig = new IgApiClient();


async function setCode() {
  ig.state.generateDevice(taskConfig.username);
  await ig.simulate.preLoginFlow();
  await ig.challenge.sendSecurityCode(taskConfig.code);

  const cookies = await ig.state.serializeCookieJar();
  const state = {
    deviceString: ig.state.deviceString,
    deviceId: ig.state.deviceId,
    uuid: ig.state.uuid,
    phoneId: ig.state.phoneId,
    adid: ig.state.adid,
    build: ig.state.build,
  };
  const sessionData = {
    cookies,
    state,
  };
  const base64Session = Buffer.from(JSON.stringify(sessionData)).toString('base64');

  if (base64Session) {
    config.set('instagram.session', base64Session);
  }

  debug(base64Session);
}


module.exports = setCode;

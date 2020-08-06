const debug = require('debug')('app:instagram:sche:code');

const config = require('../../../config');

const taskConfig = {
  username: config.get('instagram.username'),
  code: config.get('instagram.code'),
};


async function main(ig) {
  ig.state.generateDevice(taskConfig.username);
  await ig.simulate.preLoginFlow();
  // await ig.challenge.sendSecurityCode(taskConfig.code);

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

  debug(base64Session);
}

if (require.main === module) {
  main();
}

module.exports = main;

const debug = require('debug')('app:instagram:sche:logn');
const { IgApiClient, IgCheckpointError } = require('instagram-private-api');

const getCode = require('./code');

const config = require('../../../config');

const taskConfig = {
  username: config.get('instagram.username'),
  password: config.get('instagram.password'),
};

const ig = new IgApiClient();

async function main() {
  ig.state.generateDevice(taskConfig.username);
  await ig.simulate.preLoginFlow();

  try {
    await ig.account.login(taskConfig.username, taskConfig.password);
  } catch (error) {
    if (error instanceof IgCheckpointError) {
      await ig.challenge.auto(true);
      debug(ig.state.checkpoint);
    } else {
      debug(error);
    }
  }

  getCode(ig);
}

if (require.main === module) {
  main();
}

module.exports = main;

const debug = require('debug')('app:restore-followers');
const { waiter } = require('../../utils/fetch');
const config = require('../../config');
const { Follower } = require('./models');

function getUser(item) {
  return {
    id: item.pk,
    username: item.username,
    fullName: item.full_name,
    profilePicture: item.profile_pic_url,
  };
}

async function getFolloweresIfAvailable(igResponse, followers) {
  const items = await igResponse.items();
  followers.push(...items);

  if (igResponse.isMoreAvailable()) {
    debug('isMoreAvailable');
    await waiter();

    return getFolloweresIfAvailable(igResponse, followers);
  }

  return followers;
}

async function getFollowers(igClient) {
  const igResponse = igClient.feed.accountFollowers(config.get('instagram.id'));
  const followers = await getFolloweresIfAvailable(igResponse, []);

  return followers;
}

async function saveFollowers(followers) {
  const promises = followers.map((item) => {
    const user = getUser(item);

    return Follower.findOneAndUpdate({ id: user.id }, user, {
      upsert: true,
    });
  });

  await Promise.all(promises);
}

async function dropCollection() {
  const items = await Follower.count();

  if (items > 0) {
    await Follower.collection.drop();
  }
}

async function restoreFollowers(igClient) {
  debug('restoring followers');

  debug('dropping collection');
  await dropCollection();

  debug('getting followers');
  const followers = await getFollowers(igClient);

  debug('saving followers');
  await saveFollowers(followers);

  debug(`followers restored:${followers.length}`);
}

module.exports = {
  restoreFollowers,
};

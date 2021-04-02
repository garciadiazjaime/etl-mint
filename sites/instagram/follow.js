const mapSeries = require('async/mapSeries');

const debug = require('debug')('app:instagram_follow');
const { IgApiClient } = require('instagram-private-api');

const { Following, Follower } = require('./models');
const { restoreSession } = require('./support');
const config = require('../../config');

const ig = new IgApiClient();

function getUser(item) {
  return {
    id: item.pk,
    username: item.username,
    fullName: item.full_name,
    profilePicture: item.profile_pic_url,
    active: true,
  };
}

async function etlFollowing() {
  const response = ig.feed.accountFollowing(config.get('instagram.id'));

  const data = await response.items();

  const promises = data.map(async (item) => {
    const result = await Following.findOne({ id: item.pk });
    if (result) {
      return false;
    }

    const user = getUser(item);

    await Following.findOneAndUpdate({ id: user.id }, user, { // eslint-disable-line
      upsert: true,
    });

    return true;
  });

  const results = await Promise.all(promises);

  debug(`[following] new:${results.filter(item => !!item).length}, total:${results.length}`);
}

async function getFollowers(followers, response) {
  const data = await followers.items();
  response.push(...data);

  if (followers.isMoreAvailable()) {
    return getFollowers(followers, response);
  }

  return response;
}

async function etlFollowers() {
  const response = ig.feed.accountFollowers(config.get('instagram.id'));
  const data = await getFollowers(response, []);

  const promises = data.map(async (item) => {
    const result = await Follower.findOne({ id: item.pk });
    if (result) {
      return false;
    }

    const user = getUser(item);

    await Follower.findOneAndUpdate({ id: user.id }, user, {
      upsert: true,
    });

    return true;
  });

  const results = await Promise.all(promises);

  debug(`[followers] new:${results.filter(item => !!item).length}, total:${results.length}`);
}

async function removeFollowings() {
  const followers = await Follower.find({ active: true });
  const followersIDs = followers.reduce((accu, item) => {
    accu[item.id] = true;

    return accu;
  }, {});

  const since = new Date();
  since.setDate(since.getDate() - 2);

  const followings = await Following.find({ active: true, createdAt: { $lt: since } });
  const followingsToRemove = followings.reduce((accu, item) => {
    if (!followersIDs[item.id]) {
      accu.push([item.id, item.username]);
    }

    return accu;
  }, []);

  const limit = 6;
  debug(`followers:${followers.length}, following[-2days]: ${followings.length}, to-remove: ${followingsToRemove.length},${limit}`);

  await mapSeries(followingsToRemove.slice(0, limit), async ([id, username]) => {
    debug(`removing:${username}:${id}`);

    try {
      await ig.friendship.destroy(id);
      await Following.findOneAndUpdate({ id }, { active: false });
    } catch (error) {
      debug(error);
      await Following.remove({ id });
    }
  });
}

async function main() {
  await restoreSession(ig);

  await etlFollowing();

  await etlFollowers();

  await removeFollowings();
}

if (require.main === module) {
  main();
}

module.exports = main;

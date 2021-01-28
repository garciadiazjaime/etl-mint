const mapSeries = require('async/mapSeries');
const debug = require('debug')('app:post-from-etl');

const {
  graphiqlHelper, updateInstagramPost, updateInstagramUser, updateInstagramLocation,
} = require('../../../utils/mint-api');
const { getUnmappedPosts, getLocationsByID } = require('../queries-mint-api');
const { getUserAndLocationAndImage } = require('../post-etl');
const { getGeoLocation } = require('../location-etl');
const { getMeta } = require('../meta');

async function getLocationFromAPIORETL(location, cookies) {
  const { locations: apiLocations } = await graphiqlHelper(getLocationsByID(location.id));
  if (Array.isArray(apiLocations) && apiLocations.length) {
    debug(`location_found:${apiLocations[0].slug}`);
    return {
      ...apiLocations[0],
      ...location,
    };
  }

  const locationFromETL = await getGeoLocation(location, cookies);
  if (!locationFromETL) {
    return null;
  }

  const newLocation = {
    ...location,
    ...locationFromETL,
  };

  await updateInstagramLocation(newLocation);

  return newLocation;
}

function isValidUser(username) {
  return !['bajamarklaser'].includes(username);
}

async function main(cookies) {
  const { posts } = await graphiqlHelper(getUnmappedPosts(40));
  const limit = 30;
  debug(`# unmapped posts: ${posts.length}, processing ${limit}`);

  await mapSeries(posts.slice(0, limit), async (post) => {
    const responseFromETL = await getUserAndLocationAndImage(post, cookies);

    let newPost = {
      id: post.id,
    };

    if (!responseFromETL) {
      debug(`post_null:${post.id}`);

      newPost.state = 'DELETED';

      await updateInstagramPost(newPost);

      return null;
    }

    const { user, location, mediaUrl } = responseFromETL;

    newPost.state = 'MAPPED';

    if (post.mediaType === 'VIDEO' && mediaUrl) {
      newPost = {
        ...newPost,
        mediaUrl,
        mediaType: 'IMAGE',
      };
    }

    const validUser = isValidUser(user);
    if (validUser) {
      newPost.user = user;
      await updateInstagramUser(user);
    } else {
      newPost.state = 'USER_BLOCKED';
      debug(`invalid_user:${user}`);
    }

    if (validUser && location) {
      const newLocation = await getLocationFromAPIORETL(location, cookies);
      if (newLocation) {
        newPost.location = newLocation;
      } else {
        debug(`location_unknown:${location.slug}`);
      }
    }

    const meta = getMeta(post);
    newPost.meta = meta;

    await updateInstagramPost(newPost);

    return null;
  });
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

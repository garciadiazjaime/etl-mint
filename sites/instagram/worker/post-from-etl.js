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

async function main(cookies) {
  const { posts } = await graphiqlHelper(getUnmappedPosts(40));
  debug(`# unmapped posts: ${posts.length}, only processing 20`);

  await mapSeries(posts.slice(0, 20), async (post) => {
    const responseFromETL = await getUserAndLocationAndImage(post, cookies);

    if (!responseFromETL) {
      // todo: delete post
      debug(`delete.post:${post.id}`);
      return null;
    }

    const { user, location, mediaUrl } = responseFromETL;

    let newPost = {
      id: post.id,
      state: 'MAPPED',
    };

    if (post.mediaType === 'VIDEO' && mediaUrl) {
      newPost = {
        ...newPost,
        mediaUrl,
        mediaType: 'IMAGE',
      };
    }

    if (user) {
      newPost.user = user;
      await updateInstagramUser(user);
    }

    if (location) {
      const newLocation = await getLocationFromAPIORETL(location, cookies);
      if (newLocation.id) {
        newPost.location = newLocation;
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

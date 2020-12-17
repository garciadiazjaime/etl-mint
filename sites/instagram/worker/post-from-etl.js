const mapSeries = require('async/mapSeries');
const debug = require('debug')('app:post-from-etl');

const {
  graphiqlHelper, updateInstagramPost, updateInstagramUser, updateInstagramLocation,
} = require('../../../utils/mint-api');
const { getUnmappedPosts } = require('../queries-mint-api');
const { getUserAndLocationAndImage } = require('../post-etl');
const { getGeoLocation } = require('../location-etl');
const { getMeta } = require('../meta');


async function main(cookies) {
  const { posts } = await graphiqlHelper(getUnmappedPosts(40));
  debug(`# unmapped posts: ${posts.length}, only processing 20`);

  await mapSeries(posts.slice(0, 20), async (post) => {
    const responseFromETL = await getUserAndLocationAndImage(post, cookies);

    if (!responseFromETL) {
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
      newPost = {
        ...newPost,
        user,
      };
      await updateInstagramUser(user);
    }

    if (location) {
      let newLocation = {
        ...location,
      };

      const locationFromETL = await getGeoLocation(location, cookies);
      if (locationFromETL) {
        newLocation = {
          ...newLocation,
          ...locationFromETL,
        };

        await updateInstagramLocation(newLocation);
      }

      newPost = {
        ...newPost,
        location: newLocation,
      };
    }

    const meta = getMeta(post);
    newPost = {
      ...newPost,
      meta,
    };

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

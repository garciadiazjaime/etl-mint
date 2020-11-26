const mapSeries = require('async/mapSeries');
const debug = require('debug')('app:post-from-etl');

const {
  graphiqlHelper, updateInstagramPost, updateInstagramUser, updateInstagramLocation,
} = require('../../../utils/mint-api');
const { getRawPosts } = require('../queries-mint-api');
const { getUserAndLocationAndImage } = require('../post-etl');
const { getGeoLocation } = require('../location-etl');


async function main(cookies) {
  const { posts } = await graphiqlHelper(getRawPosts(100));

  await mapSeries(posts, async (post) => {
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
      const responseUser = await updateInstagramUser(user);
      debug(responseUser);
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

        const responseLocation = await updateInstagramLocation(newLocation);
        debug(responseLocation);
      }

      newPost = {
        ...newPost,
        location: newLocation,
      };
    }

    const response = await updateInstagramPost(newPost);
    debug(response);
    return null;
  });
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

const { getPosts } = require('../../../utils/mint-api');
const { getPostsFromUserId } = require('../queries-mint-api');
const { createInstagramPost } = require('../../../utils/mint-api');

function getLocation(posts) {
  if (!Array.isArray(posts) || posts.length < 3) {
    return null;
  }

  const locationsUsed = posts.reduce((accu, item) => {
    const newAccu = { ...accu };

    if (!accu[item.location.slug]) {
      newAccu[item.location.slug] = 0;
    }

    newAccu[item.location.slug] += 1;

    return newAccu;
  }, {});

  const locationWithMostPosts = Object.keys(locationsUsed).reduce((accu, item) => {
    let newAccu = { ...accu };

    if (locationsUsed[item] > newAccu.total) {
      newAccu = {
        total: locationsUsed[item],
        slug: item,
      };
    }

    return newAccu;
  }, {
    total: 0,
  });

  return posts.find(item => item.location.slug === locationWithMostPosts.slug).location;
}

async function processor(post, counter) {
  const query = getPostsFromUserId(post.user.id);
  const posts = await getPosts(query);

  const location = getLocation(posts);

  const newPost = {
    id: post.id,
    hasLocation: !!location,
  };

  if (location) {
    newPost.location = location;
    counter.increment();
  }

  return createInstagramPost(newPost);
}

module.exports = processor;

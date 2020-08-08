const debug = require('debug')('app:instagram:proc:post-without-location');

const { getPosts } = require('../../../utils/mint-api');
const { getPostsFromUserId } = require('../queries-mint-api');
const { createInstagramPost } = require('../../../utils/mint-api');

function getPhone(posts, post) {
  if (!Array.isArray(posts) || posts.length < 3) {
    debug(`not enought posts. User: ${post.user.id}, #: ${posts.length}`);
    return null;
  }

  const phonesByCount = posts.reduce((accu, item) => {
    const newAccu = { ...accu };

    item.meta.phones.forEach((phone) => {
      if (!newAccu[phone]) {
        newAccu[phone] = 0;
      }

      newAccu[phone] += 1;
    });

    return newAccu;
  }, {});

  const mostUsedPhone = Object.keys(phonesByCount).reduce((accu, phone) => {
    let newAccu = { ...accu };

    if (phonesByCount[phone] > newAccu.total) {
      newAccu = {
        total: phonesByCount[phone],
        phone,
      };
    }

    return newAccu;
  }, {
    total: 0,
  });

  return mostUsedPhone.phone;
}

async function processor(post, counter) {
  const query = getPostsFromUserId(post.user.id);
  const posts = await getPosts(query);

  const phone = getPhone(posts, post);

  const postUpdated = {
    id: post.id,
    hasPhone: !!phone,
  };

  if (phone) {
    postUpdated.meta = {
      ...post.meta,
      phones: [phone],
    };
    counter.increment();
  }

  debug(`updated, postId: ${post.id}, phone: ${!!phone}`);

  return createInstagramPost(postUpdated);
}

module.exports = processor;

const debug = require('debug')('app:instagram:etl');

const extract = require('../../utils/extract');
const { waiter } = require('../../utils/fetch');

function getLocation(postLocation) {
  if (!postLocation) {
    return null;
  }

  const address = postLocation.address_json ? JSON.parse(postLocation.address_json) : null;

  const location = {
    id: postLocation.id,
    name: postLocation.name,
    slug: postLocation.slug,
  };

  if (address) {
    location.address = {
      street: address.street_address,
      zipCode: address.zip_code,
      city: address.city_name,
      country: address.country_code,
    };
  }

  return location;
}

function transform(html) {
  let matches = html.match(/graphql":(.*)}]},"hostname"/);

  if (!Array.isArray(matches) || !matches.length) {
    matches = html.match(/{"graphql":(.*)}\);/);

    if (!Array.isArray(matches) || !matches.length) {
      return {};
    }
  }

  const data = JSON.parse(matches[1]);

  const { location, owner } = data.shortcode_media;

  const response = {
    user: {
      id: owner.id,
      username: owner.username,
      fullName: owner.full_name,
      profilePicture: owner.profile_pic_url,
    },
  };

  const postLocation = getLocation(location);
  if (postLocation) {
    response.location = postLocation;
  }

  return response;
}

async function getUser(post, cookies) {
  await waiter();

  const source = 'instagram-post';
  debug(`extract:${post.permalink}`);
  const html = await extract(post.permalink, source, cookies);

  if (html.includes('Page Not Found')) {
    return {};
  }

  return transform(html);
}


module.exports = {
  getUser,
};

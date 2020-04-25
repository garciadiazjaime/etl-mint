const debug = require('debug')('app:instagram:etl');

const extract = require('../../utils/extract');

function getLocation(location) {
  if (!location) {
    return null;
  }

  const address = location.address_json ? JSON.parse(location.address_json) : {};

  return {
    id: location.id,
    name: location.name,
    slug: location.slug,
    address: {
      street: address.street_address,
      zipCode: address.zip_code,
      city: address.city_name,
      country: address.country_code,
    },
  };
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

  const user = {
    id: owner.id,
    username: owner.username,
    fullName: owner.full_name,
    profilePicture: owner.profile_pic_url,
  };

  return {
    user,
    location: getLocation(location),
  };
}

async function getUser(post) {
  const source = 'instagram-post';

  debug(`extract:${post.permalink}`);
  const html = await extract(post.permalink, source);

  if (html.includes('Page Not Found')) {
    return {};
  }

  const data = transform(html);

  return data;
}


module.exports.getUser = getUser;

const fetch = require('node-fetch');
const mapSeries = require('async/mapSeries');

const debug = require('debug')('app:instagram:etlPost');

const { revertMathematicalBold } = require('../../utils/string');
const { getOptions } = require('../../utils/entities');
const extract = require('../../utils/extract');

const config = require('../../config');

const apiUrl = config.get('api.url');

function getLocation(location) {
  if (!location || !location.address_json) {
    return null;
  }

  const address = JSON.parse(location.address_json);

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

async function getGEOData(location) {
  if (!location || !location.id || !location.slug) {
    return null;
  }

  const source = 'instagram-location';
  const geoLocation = location;

  const url = `https://www.instagram.com/explore/locations/${location.id}/${location.slug}/`;
  debug(`extract:${url}`);
  const html = await extract(url, source);

  const matches = html.match(/_sharedData = (.*);<\/script/);
  if (Array.isArray(matches) && matches.length) {
    const data = JSON.parse(matches[1]);
    const { LocationsPage } = data.entry_data;

    if (Array.isArray(LocationsPage) && LocationsPage.length) {
      geoLocation.latitude = LocationsPage[0].graphql.location.lat;
      geoLocation.longitude = LocationsPage[0].graphql.location.lng;
    }
  }

  return geoLocation;
}

function transform(html) {
  const matches = html.match(/graphql":(.*)}]},"hostname"/);

  if (!Array.isArray(matches) || !matches.length) {
    return {};
  }

  const data = JSON.parse(matches[1]);

  const { location, owner } = data.shortcode_media;

  const place = {
    user: {
      id: owner.id,
      username: owner.username,
      fullName: revertMathematicalBold(owner.full_name),
      profilePicture: owner.profile_pic_url,
    },
    location: getLocation(location),
  };

  return place;
}

async function getPosts() {
  const payload = {
    query: `query Post {
      posts(first:1) {
        _id
        permalink
        caption
      }
    }`,
  };

  const result = await fetch(`${apiUrl}/instagram/graphiql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const {
    data: { posts },
  } = await result.json();

  return posts;
}

function isPostDeleted(html) {
  return html.includes('Page Not Found');
}

async function load(postId, body) {
  const postConfig = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    postConfig.body = JSON.stringify(body);
  }

  const result = await fetch(`${apiUrl}/instagram/post/${postId}/place`, postConfig);
  const response = await result.json();

  return response;
}

async function etl(post) {
  const source = 'etlPost';

  debug(`extract:${post.permalink}`);
  const html = await extract(post.permalink, source);

  const place = transform(html);
  debug(`transform:${!!place}`);

  if (place.location) {
    place.location = await getGEOData(place.location);
  } else if (isPostDeleted(html)) {
    place.state = 'DELETED';
  }

  if (place.user) {
    place.user.options = getOptions(post.caption);
  }

  const response = await load(post._id, place); //eslint-disable-line
  debug(`load:${post._id}:${Object.keys(response)}`); //eslint-disable-line

  return response;
}

async function main() {
  const posts = await getPosts();
  debug(`posts:${posts.length}`);

  await mapSeries(posts, etl);
}

if (require.main === module) {
  main();
}

module.exports = main;

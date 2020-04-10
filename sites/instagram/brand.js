const fetch = require('node-fetch');
const mapSeries = require('async/mapSeries');

const debug = require('debug')('app:instagram:brand');

const { revertMathematicalBold } = require('../../utils/string');
const extract = require('../../utils/extract');
const { getPosts } = require('../../utils/mintApiUtil');

const config = require('../../config');

const apiUrl = config.get('api.url');

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

function transform(html) {
  const matches = html.match(/graphql":(.*)}]},"hostname"/);

  if (!Array.isArray(matches) || !matches.length) {
    return {};
  }

  const data = JSON.parse(matches[1]);

  const { location, owner } = data.shortcode_media;

  const brand = {
    id: owner.id,
    username: owner.username,
    fullName: revertMathematicalBold(owner.full_name),
    profilePicture: owner.profile_pic_url,
    location: getLocation(location),
  };

  return brand;
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

  const result = await fetch(`${apiUrl}/instagram/post/${postId}/brand`, postConfig);
  const response = await result.json();

  return response;
}

async function getLoadData(html, post) {
  if (html.includes('Page Not Found')) {
    return {
      postState: 'DELETED',
    };
  }

  const brand = transform(html);
  brand.post = post;

  if (brand.location) {
    brand.location = await getGEOData(brand.location);
  }

  if (brand.post.caption) {
    brand.post.caption = revertMathematicalBold(brand.post.caption);
  }

  return {
    brand,
  };
}

async function etl(post) {
  const source = 'instagram-brand';

  debug(`extract:${post.permalink}`);
  const html = await extract(post.permalink, source);

  const data = await getLoadData(html, post);
  debug(`transform:${Object.keys(data)}`);

  const response = await load(post._id, data); //eslint-disable-line
  debug(`load:${post._id}:${Object.keys(response)}`); //eslint-disable-line

  return response;
}

async function main() {
  const posts = await getPosts();
  debug(`posts:${posts.length}`);

  await mapSeries(posts, etl);
  debug('------------');
}

if (require.main === module) {
  main();
}

module.exports = main;

const fetch = require('node-fetch');
const mapSeries = require('async/mapSeries');

const debug = require('debug')('app:instagram:etlPost');

const { revertMathematicalBold } = require('../../utils/string');
const extract = require('../../utils/extract');
const config = require('../../config');

const apiUrl = config.get('api.url');
const source = 'etlPost';

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
    return null;
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

async function load(postId, body) {
  if (!body) {
    return null;
  }

  const result = await fetch(`${apiUrl}/instagram/post/${postId}/place`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const response = await result.json();

  return response;
}

async function etl(post) {
  debug(`extract:${post.permalink}`);
  const html = await extract(post.permalink, source);

  const place = transform(html);
  debug(`transform:${Object.keys(place)}`);

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

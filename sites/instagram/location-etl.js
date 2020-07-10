const debug = require('debug')('app:instagram:etl');

const extract = require('../../utils/extract');
const { waiter } = require('../../utils/fetch');

const source = 'instagram-location';

async function getGeoLocation(location, cookies) {
  await waiter();

  const url = `https://www.instagram.com/explore/locations/${location.id}/${location.slug}/`;
  debug(`extract:${url}`);
  const html = await extract(url, source, cookies);

  const matches = html.match(/_sharedData = (.*);<\/script/);
  if (!Array.isArray(matches) || !matches.length) {
    return null;
  }

  const data = JSON.parse(matches[1]);
  const { LocationsPage } = data.entry_data;

  if (!Array.isArray(LocationsPage) || !LocationsPage.length) {
    return null;
  }

  if (!LocationsPage[0].graphql.location.lng || !LocationsPage[0].graphql.location.lat) {
    return null;
  }

  return {
    location: {
      type: 'Point',
      coordinates: [LocationsPage[0].graphql.location.lng, LocationsPage[0].graphql.location.lat],
    },
  };
}


module.exports = {
  getGeoLocation,
};

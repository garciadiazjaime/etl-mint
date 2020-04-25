const debug = require('debug')('app:instagram:etl');

const extract = require('../../utils/extract');

const source = 'instagram-location';

async function getGeoLocation(location) {
  if (!location || !location.id || !location.slug) {
    return null;
  }

  const url = `https://www.instagram.com/explore/locations/${location.id}/${location.slug}/`;
  debug(`extract:${url}`);
  const html = await extract(url, source);

  const matches = html.match(/_sharedData = (.*);<\/script/);
  if (!Array.isArray(matches) || !matches.length) {
    return null;
  }

  const data = JSON.parse(matches[1]);
  const { LocationsPage } = data.entry_data;

  if (!Array.isArray(LocationsPage) || !LocationsPage.length) {
    return null;
  }

  return {
    latitude: LocationsPage[0].graphql.location.lat,
    longitude: LocationsPage[0].graphql.location.lng,
  };
}


module.exports.getGeoLocation = getGeoLocation;

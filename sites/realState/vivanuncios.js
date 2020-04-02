function getCurrency(item) {
  if (item.minimumPrice && item.minimumPrice.currency) {
    return item.minimumPrice.currency;
  }

  if (item.price && item.price.currency) {
    return item.price.currency;
  }

  return null;
}

function getPrice(item) {
  if (item.minimumPrice && item.minimumPrice.amount) {
    return item.minimumPrice.amount;
  }

  if (item.price && item.price.amount) {
    return item.price.amount;
  }

  return null;
}

function getLatitude(item) {
  if (item.geo && item.geo.latitude) {
    return item.geo.latitude;
  }

  if (item.geo && item.geo.map && item.geo.map.latitude) {
    return item.geo.map.latitude;
  }

  return null;
}

function getLongitude(item) {
  if (item.geo && item.geo.longitude) {
    return item.geo.latitude;
  }

  if (item.geo && item.geo.map && item.geo.map.longitude) {
    return item.geo.map.longitude;
  }

  return null;
}

function getImages(item) {
  const response = [];
  if (Array.isArray(item.pictures) && item.pictures.length) {
    response.push(item.pictures[0].url);
  }

  if (Array.isArray(item.backgroundImagesMobile) && item.backgroundImagesMobile.length) {
    response.push(item.backgroundImagesMobile[0]);
  }

  if (Array.isArray(item.backgroundImagesDesktop) && item.backgroundImagesDesktop.length) {
    response.push(item.backgroundImagesDesktop[0]);
  }

  return response;
}

function transform(html, domain) {
  const matches = html.match(/adsToPlot":(.*),"ads":/);
  const data = JSON.parse(matches[1]);

  const places = data.map(item => ({
    address: item.geo.address,
    currency: getCurrency(item),
    description: item.description,
    images: getImages(item),
    latitude: getLatitude(item),
    longitude: getLongitude(item),
    price: getPrice(item),
    url: domain + (item.viewSeoUrl || item.seoUrl),
  }));

  return places;
}

module.exports = transform;

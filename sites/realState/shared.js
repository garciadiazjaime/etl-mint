function getLocation(place, latitude, longitude) {
  if (latitude && longitude) {
    return {
      ...place,
      gps: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    };
  }

  return place;
}

module.exports = {
  getLocation,
};

const debug = require('debug')('app:instagram:meta');

const { getBrands } = require('../../utils/mintApiUtil');
const { getOptions, getPhones } = require('../../utils/entities');
const { loadAsync } = require('../../utils/load');

const config = require('../../config');

const apiUrl = config.get('api.url');

function transform(brands) {
  return brands.map((brand) => {
    if (brand.location && brand.location.address && brand.location.address.country !== 'MX') {
      return {
        ...brand,
        state: 'DELETED',
      };
    }

    const { phones = [], options = [] } = brand;
    const { caption } = brand.post;
    let rank = 0;

    const newPhones = getPhones(caption);
    const newOptions = getOptions(caption);


    newPhones.forEach((item) => {
      if (!phones.includes(item)) {
        phones.push(item);
      }
    });

    newOptions.forEach((item) => {
      if (!options.includes(item)) {
        options.push(item);
      }
    });

    if (phones.length) {
      rank += 20;
    }

    if (options.length) {
      rank += 10;
    }

    return {
      ...brand,
      state: 'MAPPED',
      options,
      phones,
      rank,
    };
  });
}

async function main() {
  const brands = await getBrands(50);

  if (!Array.isArray(brands) || !brands.length) {
    return debug('no-brands');
  }

  const brandsExtended = transform(brands);
  debug(`transform:${brandsExtended && brandsExtended.length}`);

  const response = await loadAsync(`${apiUrl}/instagram/brands/meta`, { data: brandsExtended });

  debug(`load:${response && response.length}`);
  return debug('------------');
}

if (require.main === module) {
  main();
}

module.exports = main;

const convict = require('convict');

// Define a schema
const config = convict({
  env: {
    doc: 'The applicaton environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  api: {
    url: {
      doc: 'API URL',
      format: String,
      default: 'http://127.0.0.1:3030',
      env: 'API_URL',
    },
  },
  sites: {
    century21global: {
      active: {
        default: true,
        env: 'century21global'
      },
      domain: {
        default: 'https://www.century21global.com'
      },
      path: {
        default: '/for-sale-residential/Mexico/Baja-California/Tijuana?pageNo='
      },
      max_request: {
        default: 1
      },
      wait_secs: {
        default: 1000
      }
    },
    point2homes: {
      active: {
        default: true,
        env: 'point2homes'
      },
      domain: {
        default: 'https://www.point2homes.com'
      },
      path: {
        default: '/MX/Real-Estate-Listings/Baja-California/Tijuana.html?page='
      },
      max_request: {
        default: 1
      },
      wait_secs: {
        default: 1000
      }
    },
    baja123: {
      active: {
        default: true,
        env: 'baja123'
      },
      domain: {
        default: 'https://www.baja123.com'
      },
      path: {
        default: '/TIJUANA_REAL_ESTATE_LISTINGS/page_1754238.html'
      },
      max_request: {
        default: 1
      },
      wait_secs: {
        default: 1000
      }
    },
    propiedades: {
      active: {
        default: true,
        env: 'propiedades'
      },
      domain: {
        default: 'https://propiedades.com'
      },
      path: {
        default: '/tijuana/residencial-venta?pagina='
      },
      max_request: {
        default: 1
      },
      wait_secs: {
        default: 5000
      }
    }
  }
});

// Perform validation
config.validate({ allowed: 'strict' });

module.exports = config;
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
    baja123: {
      active: {
        default: true,
        env: 'baja123',
      },
      domain: {
        default: 'https://www.baja123.com',
      },
      path: {
        tijuana: {
          default: '/TIJUANA_REAL_ESTATE_LISTINGS/page_1754238.html',
        },
      },
    },
    century21global: {
      active: {
        default: true,
        env: 'century21global',
      },
      domain: {
        default: 'https://www.century21global.com',
      },
      path: {
        tijuana: {
          default: '/for-sale-residential/Mexico/Baja-California/Tijuana',
        },
      },
    },
    icasas: {
      active: {
        default: true,
        env: 'icasas',
      },
      domain: {
        default: 'https://www.icasas.mx',
      },
      path: {
        cancun: {
          default: '/venta/habitacionales-departamentos-economicos-quintana-roo-cancun-2_3_23_0_2473_0',
        },
      },
    },
    inmuebles24: {
      active: {
        default: true,
        env: 'inmuebles24',
      },
      domain: {
        default: 'https://www.inmuebles24.com',
      },
      path: {
        cancun: {
          default: '/inmuebles-en-venta-en-cancun.html',
        },
        tijuana: {
          default: '/inmuebles-en-venta-en-tijuana.html',
        },
      },
    },
    lamudi: {
      active: {
        default: true,
        env: 'lamudi',
      },
      domain: {
        default: 'https://www.lamudi.com.mx',
      },
      path: {
        cancun: {
          default: '/quintana-roo/benito-juarez-2/cancun-centro/for-sale/',
        },
        tijuana: {
          default: '/baja-california/tijuana/for-sale/',
        },
      },
    },
    point2homes: {
      active: {
        default: true,
        env: 'point2homes',
      },
      domain: {
        default: 'https://www.point2homes.com',
      },
      path: {
        tijuana: {
          default: '/MX/Real-Estate-Listings/Baja-California/Tijuana.html',
        },
      },
    },
    propiedades: {
      active: {
        default: true,
        env: 'propiedades',
      },
      domain: {
        default: 'https://propiedades.com',
      },
      path: {
        tijuana: {
          default: '/tijuana/residencial-venta',
        },
      },
    },
    trovit: {
      active: {
        default: true,
        env: 'trovit',
      },
      domain: {
        default: 'https://casas.trovit.com.mx',
      },
      path: {
        cancun: {
          default: '/departamento-cancun-casa',
        },
      },
    },
    vivanuncios: {
      active: {
        default: true,
        env: 'vivanuncios',
      },
      domain: {
        default: 'https://www.vivanuncios.com.mx',
      },
      path: {
        cancun: {
          default: '/s-venta-inmuebles/cancun/v1c1097l105753p1',
        },
        tijuana: {
          default: '/s-venta-inmuebles/tijuana/v1c1097l10015p1',
        },
      },
    },
  },
  instagram: {
    token: {
      env: 'INSTAGRAM_TOKEN',
      default: '',
    },
    hashtag: {
      env: 'INSTAGRAM_HASHTAG_ID',
      default: '',
    },
    userId: {
      env: 'INSTAGRAM_USER_ID',
      default: '',
    },
  },
});

// Perform validation
config.validate({ allowed: 'strict' });

module.exports = config;

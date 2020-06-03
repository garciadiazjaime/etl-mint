const fs = require('fs');
const xml2js = require('xml2js');
const debug = require('debug')('app:gcenter:worker');

const { getRequestPlain } = require('../../utils/fetch');
const { saveReport } = require('../../utils/mint-api');
const { getUUID } = require('../../utils/string');
const config = require('../../config');

const parser = new xml2js.Parser();

const typeMap = {
  1: 'passenger_vehicle_lanes',
  2: 'pedestrian_lanes',
};

const entryMap = {
  1: 'standard_lanes',
  2: 'NEXUS_SENTRI_lanes',
  3: 'ready_lanes',
};

const portsMonitored = {
  250401: {
    city: 'tijuana',
    name: 'San Ysidro',
    types: [1, 2],
    entries: [1, 2, 3],
  },
  250601: {
    city: 'tijuana',
    name: 'Otay',
    types: [1, 2],
    entries: [1, 2, 3],
  },
  250407: {
    city: 'tijuana',
    name: 'PedWest',
    types: [2],
    entries: [1, 2, 3],
  },
};


async function extract() {
  if (config.get('env') !== 'production') {
    return new Promise((resolve) => {
      fs.readFile('./stubs/gcenter.xml', (err, data) => parser.parseString(data, (err, result) => resolve(result)));
    });
  }

  const response = await getRequestPlain(config.get('gcenter.source'));

  const data = await response.text();

  return new Promise(resolve => parser.parseString(data, (err, result) => resolve(result)));
}

function getInt(value) {
  return parseInt(value, 10) || 0;
}

function transform(data) {
  const { border_wait_time: report = {} } = data || {};

  if (!Array.isArray(report.port) || !report.port.length) {
    return [];
  }

  const uuid = getUUID();

  return report.port.reduce((accu, item) => {
    const portId = parseInt(item.port_number[0], 10);

    if (portId && portsMonitored[portId]) {
      const meta = {
        portId,
        city: portsMonitored[portId].city,
        name: portsMonitored[portId].name,
        portStatus: item.port_status[0],
        uuid,
      };

      const { types, entries } = portsMonitored[portId];

      types.forEach((type) => {
        const typeKey = typeMap[type];
        if (Array.isArray(item[typeKey])) {
          entries.forEach((entry) => {
            const entryKey = entryMap[entry];
            if (Array.isArray(item[typeKey][0][entryKey])) {
              accu.push({
                ...meta,
                type,
                entry,
                updateTime: item[typeKey][0][entryKey][0].update_time[0],
                status: item[typeKey][0][entryKey][0].operational_status[0],
                delay: getInt(item[typeKey][0][entryKey][0].delay_minutes[0]),
                lanes: getInt(item[typeKey][0][entryKey][0].lanes_open[0]),
              });
            }
          });
        }
      });
    }

    return accu;
  }, []);
}

function load(data) {
  return saveReport(data);
}

async function main() {
  const data = await extract();

  const report = transform(data);

  await load(report);
  debug(report && report.length);
}


if (require.main === module) {
  main();
}

module.exports = main;

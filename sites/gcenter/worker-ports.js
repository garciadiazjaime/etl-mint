const fs = require('fs');
const xml2js = require('xml2js');
const debug = require('debug')('app:gcenter:worker');

const { getRequestPlain } = require('../../utils/fetch');
const { saveReport } = require('../../utils/mint-api');
const { getUUID } = require('../../utils/string');
const config = require('../../config');

const parser = new xml2js.Parser();

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
    const portId = item.port_number[0];

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
        if (Array.isArray(item[type])) {
          entries.forEach((entry) => {
            if (Array.isArray(item[type][0][entry])) {
              accu.push({
                ...meta,
                type,
                entry,
                updateTime: item[type][0][entry][0].update_time[0],
                status: item[type][0][entry][0].operational_status[0],
                delay: getInt(item[type][0][entry][0].delay_minutes[0]),
                lanes: getInt(item[type][0][entry][0].lanes_open[0]),
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
  debug('start');
  const data = await extract();

  const report = transform(data);
  debug(report && report.length);

  await load(report);
  debug('done');
}


if (require.main === module) {
  main();
}

module.exports = main;

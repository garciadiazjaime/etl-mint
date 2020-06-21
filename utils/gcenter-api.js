const { getRequest } = require('./fetch');
const config = require('../config');

const apiUrl = config.get('gcenter.api.url');

async function getLast24hrsSummary() {
  return getRequest(`${apiUrl}/report/last-24hrs/summary?city=tijuana`);
}

function adjustPort(port) {
  const map = {
    sanYsidro: 'SanYsidro',
    otay: 'Otay',
  };

  return map[port] || '';
}

function adjustDoor(door) {
  const map = {
    normal: 'Normal',
    readyLane: 'ReadyLane',
    sentri: 'Sentri',
  };

  return map[door] || '';
}

function getHour(value) {
  const date = new Date(value);
  const hour = date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric' });
  const plural = hour !== '1 PM';

  return `a la${plural ? 's' : ''} ${hour}`;
}

function getPublication(report) {
  const ids = {};
  let reportTime = null;

  if (!report || !Object.keys(report).length) {
    return null;
  }

  let entries = Object.keys(report).reduce((accu, port) => {
    let entry = `El día de ayer por #${adjustPort(port)}, el mayor tiempo en espera fue:`;

    Object.keys(report[port]).forEach((door) => {
      ids[report[port][door][0]._id] = true; //eslint-disable-line
      reportTime = report[port][door][0].created;
      entry += `\n#${adjustDoor(door)} 🚘 ${getHour(report[port][door][0].created)} 🕐`;
    });

    if (Object.keys(ids).length === 1) {
      entry = `El día de ayer por #${adjustPort(port)} 🚘\nel mayor tiempo en espera fue ${getHour(reportTime)} 🕐`;
    }

    accu.push(entry);

    return accu;
  }, []);

  if (Object.keys(ids).length === 1) {
    entries = [`El día de ayer por #SanYsidro y #Otay 🚘\nel mayor tiempo en espera fue ${getHour(reportTime)} 🕐`];
  }

  return entries;
}

async function getPublications() {
  const report = await getLast24hrsSummary();

  return getPublication(report);
}

module.exports = {
  getPublications,
};

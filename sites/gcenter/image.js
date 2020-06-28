const { getPorts } = require('../../utils/mint-api');
const { getLineChart, saveImage } = require('../../utils/chart');


function getData(data) {
  if (!Array.isArray(data) || !data.length) {
    return null;
  }

  const hours = {};
  const yesterday = new Date();
  yesterday.setDate(new Date().getDate() - 1);

  const response = data.reduce((accu, item) => {
    const date = new Date(parseInt(item.createdAt, 10));
    const hour = date.toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles', hour: 'numeric', day: 'numeric', hour12: false,
    });

    if (!hours[hour]) {
      hours[hour] = hour;

      if (date.getDate() === yesterday.getDate()) {
        accu[0].push({
          key: item.createdAt,
          label: date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles', hour: '2-digit' }),
          value: item.delay,
        });
      }
    }
    return accu;
  }, [[], []]);

  response[0].sort((a, b) => a.key - b.key);

  response.allKeys = Object.keys(hours).map(item => hours[item]);

  return response;
}

async function main() {
  const since = new Date();

  since.setDate(since.getDate() - 2);
  since.setHours(0, 0, 0, 0);

  const response = await getPorts({
    limit: 1000, since: since.toJSON(), name: 'San Ysidro', type: 1, entry: 1,
  });

  const data = getData(response);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  saveImage('./data/output', getLineChart({
    data,
    container: `<div id="container">
      <h2>Así estuvo la espera (minutos) ayer en Garita de San Ysidro</h2>
      <p>${yesterday.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })} - Carro 🚘</p>
      <div id="chart"></div>
    </div>`,
    lineColors: ['#173F5F', 'darkorange'],
    width: 800,
    height: 500,
    isCurve: false,
    lineWidth: 2,
  }));
}

if (require.main === module) {
  main();
}

module.exports = main;

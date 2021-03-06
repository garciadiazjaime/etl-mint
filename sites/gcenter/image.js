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
    const key = date.toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles', hour: 'numeric', day: 'numeric', hour12: false,
    });

    if (!hours[key]) {
      hours[key] = key;

      const recordDay = date.toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles', day: 'numeric',
      });
      const chartDay = yesterday.toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles', day: 'numeric',
      });

      if (recordDay === chartDay) {
        const label = date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles', hour: '2-digit' });

        const labelFormatted = !['12 AM', '12 PM'].includes(label) ? label.replace(/AM|PM/gi, '') : label;

        accu.push({
          key: item.createdAt,
          label,
          labelFormatted,
          value: item.delay,
        });
      }
    }
    return accu;
  }, []);

  response.sort((a, b) => a.key - b.key);

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

  const dateLabel = yesterday.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  saveImage('./data/output', getLineChart({
    data,
    container: `<div id="container">
      <h2>Garita de San Ysidro | ${dateLabel} - Carro</h2>
      <small>Minutos</small>
      <div id="chart"></div>
    </div>`,
    lineColors: ['#173F5F', 'darkorange'],
    width: 800,
    height: 500,
    lineWidth: 2,
  }));
}

if (require.main === module) {
  main();
}

module.exports = main;

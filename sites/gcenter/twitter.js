const mapSeries = require('async/mapSeries');
const Twitter = require('twitter-lite');
const debug = require('debug')('app:twitter');

const { getLast24hrsSummary } = require('../../utils/gcenter-api');
const { waiter } = require('../../utils/fetch');
const config = require('../../config');

const client = new Twitter({
  consumer_key: config.get('gcenter.twitter.key'),
  consumer_secret: config.get('gcenter.twitter.secret'),
  access_token_key: config.get('gcenter.twitter.tokenKey'),
  access_token_secret: config.get('gcenter.twitter.tokenSecret'),
});

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

function getTweets(report) {
  const ids = {};
  let reportTime = null;

  if (!report || !Object.keys(report).length) {
    return null;
  }

  let tweets = Object.keys(report).reduce((accu, port) => {
    let tweet = `El día de ayer por #${adjustPort(port)}, el mayor tiempo en espera fue:`;

    Object.keys(report[port]).forEach((door) => {
      ids[report[port][door][0]._id] = true; //eslint-disable-line
      reportTime = report[port][door][0].created;
      tweet += `\n#${adjustDoor(door)} 🚘 ${getHour(report[port][door][0].created)} 🕐`;
    });

    if (Object.keys(ids).length === 1) {
      tweet = `El día de ayer por #${adjustPort(port)} 🚘\nel mayor tiempo en espera fue ${getHour(reportTime)} 🕐`;
    }

    accu.push(tweet);

    return accu;
  }, []);

  if (Object.keys(ids).length === 1) {
    tweets = [`El día de ayer por #SanYsidro y #Otay 🚘\nel mayor tiempo en espera fue ${getHour(reportTime)} 🕐`];
  }

  return tweets;
}

async function main() {
  debug('start');

  const report = await getLast24hrsSummary();

  const tweets = getTweets(report);

  if (!Array.isArray(tweets) || !tweets.length) {
    return null;
  }

  await client.get('account/verify_credentials');

  return mapSeries(tweets, async (status) => {
    await client.post('statuses/update', { status });
    debug('posted', !!status);
    await waiter();
  });
}

if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;

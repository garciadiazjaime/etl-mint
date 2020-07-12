function getData(html) {
  let matches = html.match(/graphql":(.*)}]},"hostname"/);

  if (!Array.isArray(matches) || !matches.length) {
    matches = html.match(/{"graphql":(.*)}\);/);

    if (!Array.isArray(matches) || !matches.length) {
      return {};
    }
  }

  return JSON.parse(matches[1]);
}

module.exports = {
  getData,
};

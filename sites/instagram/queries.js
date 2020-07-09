function getPostID(id) {
  return `{
    posts(id:"${id}") {
      _id
    }
  }`;
}

module.exports = {
  getPostID,
};

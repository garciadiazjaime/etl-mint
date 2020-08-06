function getCounter() {
  let count = 0;

  return () => ({
    increment: () => {
      count += 1;
    },
    reset: () => {
      count = 0;
    },
    count: () => count,
  });
}

module.exports = {
  getCounter,
};

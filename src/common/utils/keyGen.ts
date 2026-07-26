const keyGen = function* () {
  let count = 0;
  // eslint-disable-next-line no-constant-condition -- infinite key sequence for list identity
  while (true) {
    yield count++;
  }
};

const uniqueKey = (() => {
  const generator = keyGen();
  return {
    nextKey: () => generator.next().value,
  };
})();

export default uniqueKey;

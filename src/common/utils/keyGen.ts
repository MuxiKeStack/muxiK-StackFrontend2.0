const keyGen = function* () {
  let count = 0;
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

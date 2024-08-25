const keyGen = function* () {
  let count = 0;
  while (true) {
    yield count++;
  }
};

const uniqueKeyUtil = (() => {
  const generator = keyGen();
  return {
    nextKey: () => generator.next().value,
  };
})();

export default uniqueKeyUtil;

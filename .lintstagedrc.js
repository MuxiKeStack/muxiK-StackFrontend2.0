const path = require('path');

const buildEslintCommand = (filenames) =>
  `eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 90 --fix ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' --file ')}`;

module.exports = {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand],
  '**/*.{js,jsx,tsx,ts,less,md,json}': ['prettier --write'],
};

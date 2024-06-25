module.exports = {
  root: true,
  env: {
    node: true,
    browser: true
  },
  extends: [
    'digitalbazaar',
    'digitalbazaar/jsdoc'
  ],
  ignorePatterns: ['dist/']
};

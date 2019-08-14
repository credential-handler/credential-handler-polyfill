module.exports = {
  entry: {
    'credential-handler-polyfill': './index.js'
  },
  output: {
    filename: '[name].min.js',
    library: 'credentialHandlerPolyfill',
    libraryTarget: 'umd'
  }
};

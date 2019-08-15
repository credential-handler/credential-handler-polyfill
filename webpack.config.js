module.exports = {
  entry: {
    'credential-handler-polyfill': './index.js'
  },
  devtool: 'source-map',
  optimization: {
    minimize: false
  },
  output: {
    filename: '[name].min.js',
    library: 'credentialHandlerPolyfill',
    libraryTarget: 'umd'
  }
};

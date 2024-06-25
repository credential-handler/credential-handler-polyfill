export default {
  entry: {
    'credential-handler-polyfill': './index.js'
  },
  mode: 'development',
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

const path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: './client/index.js', // rather than
  // ['@babel/polyfill', './client/index.js'], see:
  // https://github.com/babel/website/pull/1858/commits/6e510c60946eb2338c3895c04e04c07bfcf79901
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader'
      }
    ]
  }
};

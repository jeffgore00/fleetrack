
const path = require('path');

module.exports = {
  entry: './client/index.js',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js'
  },
  context: __dirname,
  devtool: 'source-map',
};

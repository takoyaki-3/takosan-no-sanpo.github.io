const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, '/dist')
  },
  module: {
    rules: [
        {
            test: /\.(mp3|png)$/,
            loaders: 'url-loader',
            exclude: /node_modules/
        }
    ]
  },
};
/* eslint-disable */
if (process.env.NODE_ENV != 'production') {
  console.log('Requiring dot env ... ')
  require('dotenv').config();
}

var path = require('path');
const webpack = require('webpack');

console.log('the access tokens: ', JSON.stringify(process.env.PAGE_ACCESS_TOKEN))
module.exports = [{
  devtool: 'cheap-module-eval-source-map',
  context: path.join(__dirname),
  entry: 'index',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader?-svgo' },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      { test: /\.json$/, loader: 'json-loader' }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      path.join(__dirname, 'client'),
      'node_modules'
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        APP_ID: JSON.stringify(process.env.APP_ID),
        PAGE_ID: JSON.stringify(process.env.PAGE_ID),
        SERVER_URL: JSON.stringify(process.env.SERVER_URL),
        TMN_API: JSON.stringify(process.env.TMN_API),
        PAGE_ACCESS_TOKEN: JSON.stringify(process.env.PAGE_ACCESS_TOKEN)
      },
    })
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
}];

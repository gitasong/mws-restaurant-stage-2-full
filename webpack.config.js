const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    'js/main': './client/src/js/main.js',
    'js/restaurant_info': './client/src/js/restaurant_info.js',
    'sw': './client/src/sw.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './client/public')
  },
  devtool: 'source-maps',
  mode: 'development',
  devServer: {
    port: 8080
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: 'src/js/dbhelper.js',
        to: 'js/dbhelper.js',
        toType: 'file'
      },
      {
        from: 'src/data/',
        to: 'data/',
        toType: 'dir'
      },
      {
        from: 'src/img/',
        to: 'img/',
        toType: 'dir'
      },
      {
        from: 'src/css/',
        to: 'css/',
        toType: 'dir'
      }
    ], {context: './client/'}),
    new HtmlWebpackPlugin({
      title: 'Restaurant Reviews, Stage 2',
      template: './client/src/index.html',  // origin file
      filename: 'index.html',  // destination file in public
      chunks: ['js/main'],
      inject: 'body'
    }),
    new HtmlWebpackPlugin({
      title: 'Restaurant Reviews, Stage 2',
      template: './client/src/restaurant.html',  // origin file
      filename: 'restaurant.html',  // destination file in public
      chunks: ['js/restaurant_info'],
      inject: 'body'
    }),
    new CleanWebpackPlugin(['./client/public/*/'])
  ],
  module: {
    rules: [
      {
        test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/, query: {presets: ['es2015']}
      }
    ]
  }
};

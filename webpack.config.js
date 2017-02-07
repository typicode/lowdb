var path = require('path')
var webpack = require('webpack')
var pkg = require('./package.json')
var banner = 'lowdb v' + pkg.version

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: process.argv.indexOf('-p') !== -1
      ? 'lowdb.min.js'
      : 'lowdb.js',
    library: 'low'
  },
  externals: {
    lodash: {
      root: '_' // indicates global variable
    }
  },
  plugins: [
    new webpack.BannerPlugin(banner)
  ],
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
    ]
  }
}

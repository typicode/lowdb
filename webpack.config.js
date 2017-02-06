var webpack = require('webpack')
var pkg = require('./package.json')
var banner = 'lowdb v' + pkg.version

module.exports = {
  entry: './src/main.js',
  output: {
    path: './dist',
    filename: 'lowdb.js',
    library: 'low',
    libraryTarget: 'var'
  },
  externals: {
    lodash: {
      root: "_" // indicates global variable
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

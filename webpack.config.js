var webpack = require('webpack')
var pkg = require('./package.json')
var banner = 'lowdb v' + pkg.version

module.exports = {
  entry: './src/index.js',
  output: {
    path: './dist',
    library: 'low',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.BannerPlugin(banner)
  ],
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' }
    ]
  }
}

const webpack = require('webpack')
const pkg = require('./package.json')
const banner = `lowdb v${pkg.version}`

module.exports = {
  output: {
    path: './dist',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.BannerPlugin(banner)
  ],
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel' }
    ]
  }
}

const index = require('./_index')
const storage = require('./browser')

module.exports = function low(source, opts = { storage }) {
  return index(source, opts, window._)
}

const lodash = require('lodash')
const index = require('./_index')
const storage = require('./file-sync')

module.exports = function low(source, opts = {}) {
  opts.storage = opts.storage || storage

  return index(source, opts, lodash)
}

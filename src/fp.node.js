const fp = require('./fp')
const storage = require('./storages/file-sync')

module.exports = function low(source, opts = {}) {
  opts.storage = opts.storage || storage

  return fp(source, opts)
}

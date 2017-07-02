const pify = require('pify')
const steno = require('steno')
const stringify = require('./_stringify')

module.exports = {
  read: require('./file-sync').read,
  write: function fileAsyncWrite (dest, obj, serialize = stringify) {
    const data = serialize(obj)
    return pify(steno.writeFile)(dest, data)
  }
}

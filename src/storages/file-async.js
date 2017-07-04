const fs = require('graceful-fs')
const pify = require('pify')
const steno = require('steno')
const stringify = require('./_stringify')

module.exports = {
  read: function fileSyncRead (source, deserialize = JSON.parse) {
    // fs.exists is deprecated
    if (fs.existsSync(source)) {
      // Read database
      return pify(fs.readFile)(source, 'utf-8')
        .then((read = '{}') => {
          const data = read.trim()
          return deserialize(data)
        })
        .catch(SyntaxError, (e) => {
          e.message = `Malformed JSON in file: ${source}\n${e.message}`
          throw e
        })
    } else {
      // Initialize empty database
      return pify(fs.writeFile)(source, '{}')
        .then(() => ({}))
    }
  },
  write: function fileAsyncWrite (dest, obj, serialize = stringify) {
    const data = serialize(obj)
    return pify(steno.writeFile)(dest, data)
  }
}

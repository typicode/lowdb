var fs = require('graceful-fs')
var steno = require('steno')
var Q = require('q')

module.exports = {
  // No async read
  readSync: function (file) {
    if (fs.existsSync(file)) {
      return fs.readFileSync(file, 'utf-8')
    }
  },

  write: function (file, data) {
    steno.writeFile(file, data, function (err) {
      if (err) throw err
    })
  },

  writeSync: function (file, data) {
    steno.writeFileSync(file, data)
  },

  writePromise: function (file, data) {
    var deferred = Q.defer()
    steno.writeFile(file, data, function (err) {
      if (err) {
        deferred.reject(new Error(err))
      } else {
        deferred.resolve('success')
      }
    })
    return deferred.promise
  }

}

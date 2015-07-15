var lodash = require('lodash')
var disk = require('./disk')
var jph = require('json-parse-helpfulerror')

// Returns a lodash chain that calls .value() and cb()
// automatically after the first .method()
//
// For example:
// lodashChain(array, cb).method()
//
// is the same as:
// _.chain(array).method().value(); cb()
function lowChain (_, array, cb) {
  var chain = _.chain(array)

  _.functions(chain)
    .forEach(function (method) {
      chain[method] = _.flow(chain[method], function (arg) {
        var res = arg.value ? arg.value() : arg
        cb()
        return res
      })
    })

  return chain
}

function low (file, options) {
  // Create a fresh copy of lodash
  var _ = lodash.runInContext()

  options = _.assign({
    autosave: true,
    async: true
  }, options)

  // Modify value function to call save before returning result
  var value = _.prototype.value
  _.prototype.value = function () {
    var res = value.apply(this, arguments)
    save()
    return res
  }

  // db.object checksum
  var checksum

  function save () {
    if (file && options.autosave) {
      var str = low.stringify(db.object)
      // Don't write if there's no changes
      if (str === checksum) return
      checksum = str
      options.async ? disk.write(file, str) : disk.writeSync(file, str)
    }
  }

  function db (key) {
    var array
    if (db.object[key]) {
      array = db.object[key]
    } else {
      array = db.object[key] = []
      save()
    }

    var short = lowChain(_, array, save)
    short.chain = function () {
      return _.chain(array)
    }
    return short
  }

  db.save = function (f) {
    f = f ? f : file
    disk.write(f, low.stringify(db.object))
  }

  db.saveSync = function (f) {
    f = f ? f : file
    disk.writeSync(f, low.stringify(db.object))
  }

  // Expose lodash instance
  db._ = _

  // Expose database object
  db.object = {}

  if (file) {
    // Parse file if there's some data
    // Otherwise init file
    var data = (disk.readSync(file) || '').trim()
    if (data) {
      try {
        db.object = low.parse(data)
      } catch (e) {
        if (e instanceof SyntaxError) e.message = 'Malformed JSON in file: ' + file + '\n' + e.message
        throw e
      }
    } else {
      db.saveSync()
    }
  }

  return db
}

low.stringify = function (obj) {
  return JSON.stringify(obj, null, 2)
}

low.parse = function (str) {
  return jph.parse(str)
}

module.exports = low

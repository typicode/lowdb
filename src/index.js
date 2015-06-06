var _ = require('lodash')
var disk = require('./disk')

// Returns a lodash chain that calls cb() just after .value()
//
// For example:
// lodashChain(array, cb).method().method().value()
//
// is the same as:
// _.chain(array).method().method().value(); cb()
function lodashChain (array, cb) {
  var chain = _.chain(array)

  function addCallbackOnValue (c) {
    c.value = _.flow(c.value, function (arg) {
      cb()
      return arg
    })
  }

  addCallbackOnValue(chain)

  _.functions(chain)
    .forEach(function (method) {
      chain[method] = _.flow(chain[method], function (arg) {
        var isChain = _.isObject(arg) && arg.__chain__
        if (isChain) addCallbackOnValue(arg)
        return arg
      })
    })

  return chain
}

// Returns a lodash chain that calls .value() and cb()
// automatically after the first .method()
//
// For example:
// lodashChain(array, cb).method()
//
// is the same as:
// _.chain(array).method().value(); cb()
function lowChain (array, cb) {
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
  var checksum

  options = _.assign({
    autosave: true,
    async: true
  }, options)

  function save () {
    if (file && options.autosave) {
      var str = low.stringify(db.object)
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

    var short = lowChain(array, save)
    short.chain = function () {
      return lodashChain(array, save)
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

  db.object = {}

  if (file) {
    var data = (disk.read(file) || '').trim()
    if (data) {
      try {
        db.object = low.parse(data)
      } catch (e) {
        if (e instanceof SyntaxError) e.message = 'Malformed JSON'
        e.message += ' in file:' + file
        throw e
      }
    }
  }

  return db
}

low.mixin = function (arg) {
  _.mixin(arg)
}

low.stringify = function (obj) {
  return JSON.stringify(obj, null, 2)
}

low.parse = function (str) {
  return JSON.parse(str)
}

low.exists = function(file) {
  return disk.exists(file)
}
module.exports = low

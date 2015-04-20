var fs = require('fs')
var _ = require('lodash')
var disk = require('./disk')

function lodashChain(array, cb) {
  var chain = _.chain(array)

  function addCallbackOnValue(c) {
    c.value = _.flow(c.value, function(arg) {
      cb()
      return arg
    })
  }

  addCallbackOnValue(chain)

  _.functions(chain)
    .forEach(function(method) {
      chain[method] = _.flow(chain[method], function(arg) {
        var isChain = _.isObject(arg) && arg.__chain__
        if (isChain) addCallbackOnValue(arg)
        return arg
      })
    })

  return chain
}

function lowChain(array, cb) {
  var chain = _.chain(array)

  _.functions(chain)
    .forEach(function(method) {
      chain[method] = _.flow(chain[method], function(arg) {
        var res = arg.value ? arg.value() : arg
        cb()
        return res
      })
    })

  return chain
}

function low(file, options) {
  var checksum

  options = _.assign({
    autosave: true,
    async: true
  }, options)

  function save() {
    if (file && options.autosave) {
      var str = low.stringify(db.object)
      if (str === checksum) return
      checksum = str
      options.async ? disk.write(file, str) : disk.writeSync(file, str)
    }
  }

  function db(key) {
    if (db.object[key]) {
      var array = db.object[key]
    } else {
      var array = db.object[key] = []
      save()
    }

    var short = lowChain(array, save)
    short.chain = function() {
      return lodashChain(array, save)
    }
    return short
  }

  db.save = function(f) {
    f = f ? f : file
    disk.write(f, low.stringify(db.object))
  }

  db.saveSync = function(f) {
    f = f ? f : file
    disk.writeSync(f, low.stringify(db.object))
  }

  db.object = {}

  if (file) {
    var data = disk.read(file)
    if (data) {
      try {
        db.object = low.parse(data)
      } catch (e) {
        e.message += ' in file:' + file
        throw e
      }
    } else {
      db.saveSync()
    }
  }

  return db
}

low.mixin = function(arg) {
  _.mixin(arg)
}

low.stringify = function(obj) {
  return JSON.stringify(obj, null, 2)
}

low.parse = function(str) {
  return JSON.parse(str)
}

module.exports = low

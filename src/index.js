var fs = require('fs')
var _ = require('lodash')
var utils = require('./utils')
var util = require('util')

// Modifies chain methods to save on value() call
function addSaveOnValue(db, chain, async) {
  chain.value = _.flow(chain.value, function(arg) {
    async ? db.save() : db.saveSync()
    return arg
  })

  for (var prop in chain) {
    if (_.isFunction(chain[prop]) && prop !== 'value') {
      chain[prop] = _.flow(chain[prop], function(arg) {
        addSaveOnValue(db, arg, async)
        return arg
      })
    }
  }
}

// Add methods that automatically calls .value()
function addShortSyntax(db, chain, async) {
  for (var prop in chain) {
    if (_.isFunction(chain[prop])) {
      chain['$' + prop] = _.flow(chain[prop], function(arg) {
        var v = arg.value()
        async ? db.save() : db.saveSync()
        return v
      })
    }
  }
}

function low(file, options) {
  var options = _.assign({
    autosave: true,
    async: true
  }, options)

  function db(key) {
    var array = db.object[key] = db.object[key] || []
    var chain = _.chain(array)

    if (file && options.autosave) {
      addSaveOnValue(db, chain, options.async)
      addShortSyntax(db, chain, options.async)
    }

    return chain
  }

  db.save = function(f) {
    f = f ? f : file
    utils.saveAsync(f, low.stringify(db.object))
  }

  db.saveSync = function(f) {
    f = f ? f : file
    utils.saveSync(f, low.stringify(db.object))
  }
  
  db.object = utils.getObject(file, low.parse)

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

var fs = require('fs')
var _ = require('lodash')
var utils = require('./utils')

function low(file, options) {
  var obj = utils.getObject(file, low.parse)

  var options = _.assign({
    autosave: true,
    async: true
  }, options)

  function db(key) {
    var array = obj[key] = obj[key] || []
    var chain = _.chain(array)

    if (file && options.autosave) {
      var save = function() {
        options.async ? db.save() : db.saveSync()
      }

      utils.composeAll(chain, function(arg) {
        save()
        return arg
      })

      save()
    }

    return chain
  }

  db.save = function(f) {
    f = f ? f : file
    utils.saveAsync(file, low.stringify(obj))
  }

  db.saveSync = function(f) {
    f = f ? f : file
    utils.saveSync(file, low.stringify(obj))
  }

  db.object = obj

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

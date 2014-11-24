var fs = require('fs')
var _ = require('lodash')
var utils = require('./utils')

function low(file, options) {
  var obj = utils.getObject(file, low.parse)

  function db(key) {
    var array = obj[key] = obj[key] || []
    var chain = _.chain(array)

    utils.composeAll(chain, function(arg) {
      db.save()
      return arg
    })

    db.save()

    return chain
  }

  db.save = _.noop

  if (file) {
    if (options && options.async) {
      db.save = function(f) {
        f = f ? f : file
        utils.saveAsync(file, low.stringify(obj))
      }
    } else {
      db.save = function(f) {
        f = f ? f : file
        utils.saveSync(file, low.stringify(obj))
      }
    }
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

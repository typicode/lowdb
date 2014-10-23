var fs = require('fs')
var _ = require('lodash')
var write = require('./write')

// Compose every function with fn
function composeAll(obj, fn) {
  for (var key in obj) {
    if (_.isFunction(obj[key])) {
      obj[key] = _.compose(fn, obj[key])
    }
  }
}

function Low(filename) {
  if (filename) {
    if (fs.existsSync(filename)) {
      var object = low.parse(fs.readFileSync(filename))
    } else {
      fs.writeFileSync(filename, '{}')
      var object = {}
    }
  } else {
    var object = {}
  }

  function chain(name) {
    // Create empty array if it doesn't exist
    object[name] = object[name] || []

    // Save it
    if (filename) chain.save()

    // Create a Lo-Dash chained array
    var chainedArray = _.chain(object[name])

    // Hack, wrap every Lo-Dash function to call save.
    // Save is however throttled and only happens if database object
    // has changed.
    // With Node 0.12 and Object.observe support, this bit of code should be
    // removed :)
    if (filename) composeAll(chainedArray, function(arg) {
      chain.save()
      return arg
    })

    return chainedArray
  }

  // Expose store object
  chain.object = object

  // Call it to manually save database
  chain.save = function() {
    if (filename) write(filename, low.stringify(object))
  }

  return chain
}

function low(filename) {
  return new Low(filename)
}

low.sync = function(filename) {
  var db = low(filename)
  db.save = function() {
    if (filename) fs.writeFileSync(filename, low.stringify(object))
  }
}

low.mixin = function(source) {
  _.mixin(source)
}

low.stringify = function(obj) {
  return JSON.stringify(obj, null, 2)
}

low.parse = function(str) {
  return JSON.parse(str)
}

module.exports = low

var _ = require('lodash')
var Store = require('./store')

// Compose every function with fn
function composeAll(obj, fn) {
  for (var key in obj) {
    if (_.isFunction(obj[key])) {
      obj[key] = _.compose(fn, obj[key])
    }
  }
}

function Low(filename) {
  // Create a new JSON file and get object
  if (filename) {
    var store = new Store(filename)
    var object = store.object
  } else {
    var object = {}
  }

  function chain(name) {
    // Create empty array if it doesn't exist
    object[name] = object[name] || []

    if (filename) store.save()

    // Chain array
    var chainedArray = _.chain(object[name])

    // Hack, wrap every Lo-Dash function to call save.
    // Save is however throttled and only happens if database object
    // has changed.
    // With Node 0.12 and Object.observe support, this bit of code should
    // removed :)
    if (filename) composeAll(chainedArray, function(arg) {
      store.save()
      return arg
    })

    return chainedArray
  }

  // Expose store object
  chain.object = object

  // Call it to manually save database
  chain.save = function() {
    if (store) store.save()
  }

  return chain
}

function low(filename) {
  return new Low(filename)
}

low.mixin = function(source) {
  _.mixin(source)
}

module.exports = low
var _ = require('lodash')
var disk = require('./disk')
var fs = require('graceful-fs')

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

function low (path, options) {
  var checksum

  options = _.assign({
    autosave: true,
    async: true
  }, options)

  function save () {
    if (options.autosave) {
      var str = low.stringify(db.object)
      if (str === checksum) return
      checksum = str
      savePath(path, db.object, options.async)
    }
  }

  function savePath (path, obj, async) {
    if (path) {
      if (async) {
        fs.exists(path, function (exists) {

          if (exists) {
            fs.stat(path, function (err, stat) {
              if (err) throw err

              if (stat.isFile()) {
                saveFile(path, obj, async)
              } else if (stat.isDirectory()) {
                for (var key in obj) {
                  var file = path + '/' + key + '.json'
                  saveFile(file, obj[key], async)
                }
              }
            })
          } else {
            saveFile(path, obj, async)
          }

        })
      } else {
        var stat = fs.existsSync(path) ? fs.statSync(path) : null
        if (!stat || stat.isFile()) {
          saveFile(path, obj, async)
        } else if (stat.isDirectory()) {
          for (var key in obj) {
            var file = path + '/' + key + '.json'
            saveFile(file, obj[key], async)
          }
        }
      }
    }
  }

  function saveFile (file, obj, async) {
    var str = low.stringify(obj)
    async ? disk.write(file, str) : disk.writeSync(file, str)
  }

  function readPath (path) {
    var stat = fs.existsSync(path) ? fs.statSync(path) : null
    var data = null
    if (!stat || stat.isFile()) {
      data = readFile(path)
    } else if (stat.isDirectory()) {
      _(fs.readdirSync(path))
        .each(function (file) {
          var match = file.match(/(.*)\.json$/)
          var key = match && match[1]
          if (key) {
            var value = readFile(path + '/' + file)
            if (value) {
              data = data || {}
              data[key] = value
            }
          }
        }).value()
    }

    if (data) {
      db.object = data
    } else {
      db.saveSync()
    }
  }

  function readFile (file) {
    var data = disk.read(file)
    if (data && data.trim() !== '') {
      try {
        return low.parse(data)
      } catch (e) {
        if (e instanceof SyntaxError) e.message = 'Malformed JSON'
        e.message += ' in file:' + file
        throw e
      }
    }

    return null
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

  db.save = function (p) {
    p = p ? p : path
    savePath(p, db.object, true)
  }

  db.saveSync = function (p) {
    p = p ? p : path
    savePath(p, db.object, false)
  }

  db.object = {}

  if (path) {
    readPath(path)
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

module.exports = low

const lodash = require('lodash')
const isPromise = require('is-promise')

// Returns a lodash chain that calls .value()
// automatically after the first .method()
//
// It also returns a promise or value
//
// For example:
// lowChain(_, array, save).method()
//
// is the same as:
// _.chain(array).method().value()
function lowChain (_, array, save) {
  const chain = _.chain(array)

  _.functionsIn(chain)
    .forEach(method => {
      chain[method] = _.flow(chain[method], arg => {
        let v
        if (arg) {
          v = _.isFunction(arg.value) ? arg.value() : arg
        }

        const s = save()

        if (s) return s.then(() => Promise.resolve(v))
        return v
      })
    })

  return chain
}

function low (source, options = {}, writeOnChange = true) {
  // Create a fresh copy of lodash
  const _ = lodash.runInContext()

  if (source) {
    if (options.storage) {
      const { storage } = options

      if (storage.read) {
        db.read = (s = source) => {
          const res = storage.read(s, db.deserialize)

          if (isPromise(res)) {
            return res.then((obj) => {
              db.object = obj
              db._checksum = JSON.stringify(db.object)

              return db
            })
          }

          db.object = res
          db._checksum = JSON.stringify(db.object)

          return db
        }
      }

      if (storage.write) {
        db.write = (dest = source) => storage.write(dest, db.object, db.serialize)
      }
    }

    if (options.format) {
      const { format } = options
      db.serialize = format.serialize
      db.deserialize = format.deserialize
    }
  }

  // Modify value function to call save before returning result
  _.prototype.value = _.wrap(_.prototype.value, function (value) {
    const v = value.apply(this)
    const s = _save()

    if (s) return s.then(() => Promise.resolve(v))
    return v
  })

  // Return a promise or nothing in sync mode or if the database hasn't changed
  function _save () {
    if (db.source && db.write && writeOnChange) {
      const str = JSON.stringify(db.object)

      if (str !== db._checksum) {
        db._checksum = str
        return db.write(db.source, db.object)
      }
    }
  }

  function db (key) {
    if (typeof db.object[key] === 'undefined') {
      db.object[key] = []
    }
    let array = db.object[key]
    let short = lowChain(_, array, _save)
    short.chain = () => _.chain(array)
    return short
  }

  // Expose
  db._ = _
  db.object = {}
  db.source = source

  // Init
  if (db.read) {
    return db.read()
  } else {
    return db
  }
}

module.exports = low

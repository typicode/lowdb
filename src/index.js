const lodash = require('lodash')

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

  _.functions(chain)
    .forEach((method) => {
      chain[method] = _.flow(chain[method], (arg) => {
        const v = arg.value ? arg.value() : arg
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
      db.read = storage.read
      db.write = storage.write
        ? (dest = source) => storage.write(dest, db.object, db.serialize)
        : null
    }

    options.format && Object.assign(db, options.format)
  }

  // Modify value function to call save before returning result
  _.prototype.value = _.wrap(_.prototype.value, function (value) {
    const v = value.apply(this)
    const s = _save()

    if (s) return s.then(() => Promise.resolve(v))
    return v
  })

  // Init db.object checksum
  let checksum = JSON.stringify(db.object)

  // Return a promise or nothing in sync mode or if the database hasn't changed
  function _save () {
    if (db.source && db.write && writeOnChange) {
      const str = JSON.stringify(db.object)

      if (str !== checksum) {
        checksum = str
        return db.write(db.source, db.object)
      }
    }
  }

  function db (key) {
    let array = db.object[key] = db.object[key] || []
    let short = lowChain(_, array, _save)
    short.chain = () => _.chain(array)
    return short
  }

  // Expose
  db._ = _
  db.object = {}
  db.source = source

  // Init
  if (db.source && db.read) {
    db.object = db.read(db.source, db.deserialize)
  }

  return db
}

module.exports = low

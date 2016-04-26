const lodash = require('lodash')
const isPromise = require('is-promise')

function low (source, options = {}, writeOnChange = true) {
  // Create a fresh copy of lodash
  const _ = lodash.runInContext()

  // Apply mixin option
  if (options.mixin) _.mixin(options.mixin)

  // Create shortcut functions
  _.functions(_)
    .forEach(fn => _.mixin({
      [`$${fn}`]: fn,
      chain: false
    }))

  const db = _.chain({})

  if (source) {
    if (options.storage) {
      const { storage } = options

      if (storage.read) {
        db.read = (s = source) => {
          const res = storage.read(s, db.deserialize)
          const init = (obj) => {
            db.__wrapped__ = obj
            db._checksum = JSON.stringify(db.__wrapped__)
          }

          if (isPromise(res)) {
            return res.then((obj) => {
              init(obj)
              return db
            })
          }

          init(res)
          return db
        }
      }

      if (storage.write) {
        db.write = (dest = source) => storage.write(dest, db.__wrapped__, db.serialize)
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

    if (db.source && db.write && writeOnChange) {
      const str = JSON.stringify(db.__wrapped__)

      if (str !== db._checksum) {
        db._checksum = str
        db.write(db.source, db.__wrapped__)
      }
    }

    return v
  })

  db._ = _
  db.getObject = () => db.__wrapped__
  db.setObject = (obj) => db.__wrapped__ = obj
  db.source = source

  // Read
  if (db.read) {
    return db.read()
  } else {
    return db
  }
}

module.exports = low

const lodash = require('lodash')
const isPromise = require('is-promise')
const defaultStorage = require('./file-sync')

const defaultOptions = {
  storage: defaultStorage,
  writeOnChange: true
}

function low (source, options = defaultOptions) {
  // Create a fresh copy of lodash
  const _ = lodash.runInContext()

  // Apply mixin option
  if (options.mixin) _.mixin(options.mixin)

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

    if (db.source && db.write && options.writeOnChange) {
      const str = JSON.stringify(db.__wrapped__)

      if (str !== db._checksum) {
        db._checksum = str
        db.write(db.source, db.__wrapped__)
      }
    }

    return v
  })


  // Get or set database state
  db.state = (obj) => {
    if (obj) {
      db.__wrapped__ = obj
    } else {
      return db.__wrapped__
    }
  }

  db._ = _
  db.source = source



  // Read
  if (db.read) {
    return db.read()
  } else {
    return db
  }
}

module.exports = low

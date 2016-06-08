const isPromise = require('is-promise')

module.exports = function (source, {
  format = null,
  storage = null,
  writeOnChange = true
} = {}, lodash) {
  // Create a fresh copy of lodash
  const _ = lodash.runInContext()

  const db = _.chain({})

  if (source) {
    if (storage) {
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

    if (format) {
      db.serialize = format.serialize
      db.deserialize = format.deserialize
    }
  }

  // Persist database state
  function persist() {
    if (db.source && db.write && writeOnChange) {
      const str = JSON.stringify(db.__wrapped__)

      if (str !== db._checksum) {
        db._checksum = str
        db.write(db.source, db.__wrapped__)
      }
    }
  }

  // Modify value function to call save before returning result
  _.prototype.value = _.wrap(_.prototype.value, function (value) {
    const v = value.apply(this)
    persist()
    return v
  })


  // Get or set database state
  db.getState = () => db.__wrapped__
  db.setState = (state) => {
    db.__wrapped__ = state
    persist()
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

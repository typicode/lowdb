const isPromise = require('is-promise')
const memory = require('./memory')

function plant(db, obj) {
  db.__wrapped__ = obj
  return db
}

module.exports = function (source, opts = {}, lodash) {
  // Create a fresh copy of lodash
  const _ = lodash.runInContext()

  const db = _.chain({})

  // assign format.serialize and format.deserialize if present
  _.assign(db, opts.format)

  // Set storage
  // In-memory if no source is provided
  const storage = source
    ? _.defaults({}, opts.storage, memory)
    : _.defaults({}, memory)

  db.read = (s = source) => {
    const r = storage.read(s, db.deserialize)
    if (isPromise(r)) {
      return r.then(obj => plant(db, obj))
    }
    return plant(db, r)
  }

  // Add write function to call save before returning result
  _.prototype.write = _.wrap(_.prototype.value, function (func, dest = source) {
    const funcRes = func.apply(this)

    const p = storage.write(dest, db.value(), db.serialize)
    if (isPromise(p)) {
      return p.then(() => funcRes)
    }

    return funcRes
  })


  // Get or set database state
  db.getState = db.value
  db.setState = async (state) => {
    plant(db, state)
    await db.write()
  }

  db._ = _
  db.source = source

  // Read
  db.read()
  return db
}

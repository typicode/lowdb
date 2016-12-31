const isPromise = require('is-promise')
const memory = require('./storages/memory')

function plant(db, obj) {
  db.state = obj
  return db
}

module.exports = function (source, opts = {}, lodash) {
  // assign format.serialize and format.deserialize if present
  _.assign(db, opts.format)

  // Set storage
  // In-memory if no source is provided
  const storage = source
    ? _.defaults({}, opts.storage, memory)
    : _.defaults({}, memory)

  db.read = (s = source) => {
    const r = storage.read(s, db.deserialize)

    return isPromise(r)
      ? r.then(obj => plant(db, obj))
      : plant(db, r)
  }

  // Add write function to call save before returning result
  _.prototype.write = _.wrap(_.prototype.value, function (func, dest = source) {
    const funcRes = func.apply(this)

    const p = storage.write(dest, db.value(), db.serialize)
    return isPromise(p)
      ? p.then(() => funcRes)
      : funcRes
  })

  db.source = source

  // Read
  db.read()
  return db
}

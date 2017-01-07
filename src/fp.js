const isPromise = require('is-promise')
const flow = require('lodash/fp/flow')
const assign = require('lodash/assign')
const defaults = require('lodash/defaults')
const get = require('lodash/get')
const set = require('lodash/set')

const memory = require('./storages/memory')

function plant(db, obj) {
  db.__state__ = obj
  return db
}

module.exports = function (source, opts = {}) {
  const db = (path, defaultValue) => {
    function value(funcs) {
      const result = get(db.getState(), path, defaultValue)
      return flow(funcs)(result)
    }

    value.write = (...funcs) => {
      const result = value(...funcs)
      set(db.getState(), path, result)

      const w = db.write()

      return isPromise(w)
        ? w.then(() => result)
        : result
    }

    return value
  }

  // assign format.serialize and format.deserialize if present
  assign(db, opts.format)

  // Set storage
  // In-memory if no source is provided
  const storage = source
    ? defaults({}, opts.storage, memory)
    : defaults({}, memory)

  db.read = (s = source) => {
    const r = storage.read(s, db.deserialize)

    return isPromise(r)
      ? r.then(obj => plant(db, obj))
      : plant(db, r)
  }

  db.write = (dest = source) => storage.write(dest, db.getState(), db.serialize)

  // Get or set database state
  db.getState = () => db.__state__
  db.setState = async (state) => {
    plant(db, state)
    await db.write()
  }

  db.source = source

  // Read
  db.read()
  return db
}
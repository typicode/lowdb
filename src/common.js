const assign = require('lodash/assign')
const defaults = require('lodash/defaults')
const isPromise = require('is-promise')
const memory = require('./storages/memory')
const defaultStorage = require('./storages/file-sync')

const init = (db, key, source, opts) => {
  opts.storage = opts.storage || defaultStorage

  db.source = source

  // assign format.serialize and format.deserialize if present
  assign(db, opts.format)

  // Set storage
  // In-memory if no source is provided
  db.storage = db.source
    ? defaults({}, opts.storage, memory)
    : defaults({}, memory)

  db.read = (s = source) => {
    const r = db.storage.read(s, db.deserialize)

    return isPromise(r)
      ? r.then(db.plant)
      : db.plant(r)
  }

  db.write = (dest = source, defaultValue) => {
    const value = defaultValue || db.getState()
    const w = db.storage.write(dest, db.getState(), db.serialize)
    return isPromise(w)
      ? w.then(() => value)
      : value
  }

  db.plant = (state) => { db[key] = state }
  db.getState = () => db[key]
  db.setState = (state) => {
    db.plant(state)
    return db.write()
  }

  db.read()

  return db
}

module.exports = {
  init
}

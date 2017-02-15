const isPromise = require('is-promise')
const memory = require('./storages/memory')
const defaultStorage = require('./storages/file-sync')

const init = (
  db,
  key,
  source,
  {
    storage = defaultStorage,
    format = {}
  } = {}) => {
  db.source = source

  // Set storage
  // In-memory only if no source is provided
  db.storage = {
    ...memory,
    ...(db.source && storage)
  }

  db.read = (s = source) => {
    const r = db.storage.read(s, format.deserialize)

    return isPromise(r)
      ? r.then(db.plant)
      : db.plant(r)
  }

  db.write = (dest = source, ...args) => {
    const value = args.length
      ? args[0]
      : db.getState()

    const w = db.storage.write(dest, db.getState(), format.serialize)
    return isPromise(w)
      ? w.then(() => value)
      : value
  }

  db.plant = (state) => {
    db[key] = state
    return db
  }

  db.getState = () => db[key]

  db.setState = (state) => {
    db.plant(state)
    return db.write()
  }

  return db.read()
}

module.exports = {
  init
}

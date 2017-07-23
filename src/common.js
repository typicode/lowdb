const isPromise = require('is-promise')
const memory = require('./adapters/memory')
const defaultStorage = require('./adapters/FileSync')

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
    const r = adapter.read(s)

    return isPromise(r)
      ? r.then(db.plant)
      : db.plant(r)
  }

  db.write = (dest = source, ...args) => {
    const value = args.length
      ? args[0]
      : db.getState()

    const w = adapter.write(db.getState())
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

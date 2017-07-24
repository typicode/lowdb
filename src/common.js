const isPromise = require('is-promise')
const Memory = require('./adapters/Memory')

const init = (
  db,
  key,
  adapter = new Memory()) => {
  db.read = () => {
    const r = adapter.read()

    return isPromise(r)
      ? r.then(db.plant)
      : db.plant(r)
  }

  db.write = () => {
    const w = adapter.write(db.getState())
    return isPromise(w)
      ? w.then(() => db.getState())
      : db.getState()
  }

  db.plant = (state) => {
    db[key] = state
    return db
  }

  db.getState = () => db[key]

  db.setState = (state) => {
    db.plant(state)
    return db
  }

  return db.read()
}

module.exports = {
  init
}

const isPromise = require('is-promise')

const init = (db, key, adapter) => {
  db.read = () => {
    const r = adapter.read()

    return isPromise(r) ? r.then(db.plant) : db.plant(r)
  }

  db.write = (value = db.getState()) => {
    const w = adapter.write(db.getState())

    return isPromise(w) ? w.then(() => value) : value
  }

  db.plant = state => {
    db[key] = state
    return db
  }

  db.getState = () => db[key]

  db.setState = state => {
    db.plant(state)
    return db
  }

  return db.read()
}

module.exports = {
  init
}

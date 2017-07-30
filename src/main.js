const lodash = require('lodash')
const isPromise = require('is-promise')
const Memory = require('./adapters/Memory')
const common = require('./common')

module.exports = function (adapter) {
  if (typeof adapter !== 'object') {
    throw new Error('Adapter must be provided')
  }

  // Create a fresh copy of lodash
  const _ = lodash.runInContext()
  const db = _.chain({})

  // Expose _ for mixins
  db._ = _

  // Add write function to lodash
  // Calls save before returning result
  _.prototype.write = _.wrap(_.prototype.value, function (func) {
    const funcRes = func.apply(this)
    return db.write(funcRes)
  })

  db.read = () => {
    const r = adapter.read()

    return isPromise(r)
      ? r.then(db.plant)
      : db.plant(r)
  }

  db.write = (returnValue) => {
    const w = adapter.write(db.getState())

    return isPromise(w)
      ? w.then(() => returnValue)
      : returnValue
  }

  db.plant = (state) => {
    db.__wrapped__ = state
    return db
  }

  db.getState = () => db.__wrapped__

  db.setState = (state) => {
    db.plant(state)
    return db
  }

  return db.read()
}

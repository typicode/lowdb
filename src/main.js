const lodash = require('lodash')
const isPromise = require('is-promise')

module.exports = function(adapter) {
  if (typeof adapter !== 'object') {
    throw new Error(
      'An adapter must be provided, see https://github.com/typicode/lowdb/#usage'
    )
  }

  // Create a fresh copy of lodash
  const _ = lodash.runInContext()
  const db = _.chain({})

  // Add write function to lodash
  // Calls save before returning result
  _.prototype.write = _.wrap(_.prototype.value, function(func) {
    const funcRes = func.apply(this)
    return db.write(funcRes)
  })

  function plant(state) {
    db.__wrapped__ = state
    return db
  }

  // Lowdb API
  // Expose _ for mixins
  db._ = _

  db.read = () => {
    const r = adapter.read()
    return isPromise(r) ? r.then(plant) : plant(r)
  }

  db.write = returnValue => {
    const w = adapter.write(db.getState())
    return isPromise(w) ? w.then(() => returnValue) : returnValue
  }

  db.getState = () => db.__wrapped__

  db.setState = state => plant(state)

  return db.read()
}

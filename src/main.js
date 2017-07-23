const lodash = require('lodash')
const common = require('./common')

module.exports = function (adapter) {
  // Create a fresh copy of lodash
  const _ = lodash.runInContext()
  const db = _.chain({})

  // Expose _ for mixins
  db._ = _

  // Add write function to lodash
  // Calls save before returning result
  _.prototype.write = _.wrap(_.prototype.value, function (func) {
    const funcRes = func.apply(this)
    return adapter.write(funcRes)
  })

  return common.init(db, '__wrapped__', adapter)
}

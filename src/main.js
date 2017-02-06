import lodash from 'lodash'
import common from './common'

module.exports = function (source, opts = {}) {
  // Create a fresh copy of lodash
  const _ = lodash.runInContext()
  const db = _.chain({})

  // Expose _ for mixins
  db._ = _

  // Add write function to lodash
  // Calls save before returning result
  _.prototype.write = _.wrap(_.prototype.value, function (func, dest = source) {
    const funcRes = func.apply(this)
    return db.write(dest, funcRes)
  })

  return common.init(db, '__wrapped__', source, opts)
}

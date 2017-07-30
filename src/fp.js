const flow = require('lodash/flow')
const get = require('lodash/get')
const set = require('lodash/set')
const common = require('./common')

module.exports = function(adapter) {
  function db(path, defaultValue) {
    function getValue(funcs) {
      const result = get(db.getState(), path, defaultValue)
      return flow(funcs)(result)
    }

    getValue.write = (...funcs) => {
      const result = getValue(...funcs)
      set(db.getState(), path, result)
      return db.write()
    }

    return getValue
  }

  return common.init(db, '__state__', adapter)
}

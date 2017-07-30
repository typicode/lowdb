const common = require('./common')

module.exports = function(adapter) {
  return common.init({}, '__state__', adapter)
}

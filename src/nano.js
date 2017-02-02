const common = require('./common')

module.exports = function (source, opts = {}) {
  return common.init({}, '__state__', source, opts)
}

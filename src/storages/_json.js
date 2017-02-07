var jph = require('json-parse-helpfulerror')

module.exports = {
  parse: jph.parse,
  stringify: (obj) => JSON.stringify(obj, null, 2)
}

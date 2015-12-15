var jph = require('json-parse-helpfulerror')

module.exports = {
  parse: jph.parse,
  stringify: (obj) => {
    return JSON.stringify(obj, null, 2)
  }
}

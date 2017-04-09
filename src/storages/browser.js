/* global localStorage */
const stringify = require('./_stringify')

module.exports = {
  read: function browserRead (source, deserialize = JSON.parse) {
    const data = localStorage.getItem(source)
    if (data) {
      return deserialize(data)
    } else {
      localStorage.setItem(source, '{}')
      return {}
    }
  },
  write: function browserWrite (dest, obj, serialize = stringify) {
    localStorage.setItem(dest, serialize(obj))
  }
}

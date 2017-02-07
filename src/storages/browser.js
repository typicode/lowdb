/* global localStorage */

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
  write: function browserWrite (dest, obj, serialize = JSON.stringify) {
    localStorage.setItem(dest, serialize(obj))
  }
}

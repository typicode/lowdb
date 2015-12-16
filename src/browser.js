/* global localStorage */

module.exports = {
  read: (source, deserialize = JSON.parse) => {
    const data = localStorage.getItem(source)
    if (data) {
      return deserialize(data)
    } else {
      localStorage.setItem(source, '{}')
      return {}
    }
  },
  write: (dest, obj, serialize = JSON.stringify) => localStorage.setItem(dest, serialize(obj))
}

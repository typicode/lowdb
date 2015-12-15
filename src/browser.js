/* global localStorage */

module.exports = {
  read: (source, deserialize = JSON.parse) => deserialize(localStorage.getItem(source)),
  write: (dest, obj, serialize = JSON.stringify) => localStorage.setItem(dest, serialize(obj))
}

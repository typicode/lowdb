/* global localStorage */
const Base = require('./Base')

class LocalStorage extends Base {
  read() {
    const data = localStorage.getItem(this.source)
    if (data) {
      return this.deserialize(data)
    } else {
      localStorage.setItem(this.source, this.serialize(this.defaultValue))
      return this.defaultValue
    }
  }

  write(data) {
    localStorage.setItem(this.source, this.serialize(data))
  }
}

module.exports = LocalStorage

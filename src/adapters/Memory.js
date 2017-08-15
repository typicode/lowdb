const Base = require('./Base')

module.exports = class Memory extends Base {
  read() {
    return this.defaultValue
  }
  write() {}
}

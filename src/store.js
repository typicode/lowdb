var fs = require('fs')
var _ = require('lodash')
var Writer = require('./writer')

function stringify(obj) {
  return JSON.stringify(obj, null, 2)
}

function Store(filename) {
  if (fs.existsSync(filename)) {
    this.object = JSON.parse(fs.readFileSync(filename))
  } else {
    fs.writeFileSync(filename, '{}')
    this.object = {}
  }

  this.writer = new Writer(filename)

  return this
}

Store.prototype.save = _.throttle(function() {
  this.writer.write(stringify(this.object))
}, 10)

module.exports = Store
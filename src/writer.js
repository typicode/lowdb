var fs = require('graceful-fs')
var tempWrite = require('temp-write')
var mv = require('mv')

function atomicWrite(filePath, data, callback) {
  tempWrite(data, function(err, tempFilePath) {
    if (err) throw err
    mv(tempFilePath, filePath, function(err) {
      if (err) throw err
      callback()
    })
  })
}

function Writer(filePath) {
  this.filePath = filePath
  this.writing = false
  this.previous = null
}

Writer.prototype.write = function(data) {
  if (this.writing) {
    this.next = data
  } else if (data !== this.current) {
    this.writing = true
    this.current = data
    var self = this
    atomicWrite(this.filePath, data, function() {
      self.writing = false
      if (self.next) self.write.apply(self, [self.next])
    })
  }
}

module.exports = Writer




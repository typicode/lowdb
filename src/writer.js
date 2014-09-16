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
  var self = this

  if (this.previous !== data && !this.writing) {

    this.writing = true

    atomicWrite(this.filePath, data, function() {

      self.previous = data
      self.writing = false

      if (self.next) self.next()

    })

  } else {

    this.next = function() {
      self.write(data)
    }

  }
}

module.exports = Writer




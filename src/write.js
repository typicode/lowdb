var os = require('os')
var path = require('path')
var fs = require('graceful-fs')
var uuid = require('uuid')
var mv = require('mv')
var steno = require('steno')

function createTempPath() {
  return path.join(os.tmpdir(), uuid())
}

var tempFiles = {}

function getTempFile(filename) {
  return tempFiles[filename] = tempFiles[filename] || createTempPath()
}

var writers = {}

function getWriter(filename) {
  if (writers[filename]) {
    return writers[filename]
  } else {
    var w = writers[filename] = steno(getTempFile(filename))

    w.setCallback(function(data, next) {
      mv(this.filename, filename, next)
    })

    return w
  }
}

module.exports = function(filename, data) {
  getWriter(filename).write(data)
}




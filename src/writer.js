var fs = require('graceful-fs')
var temp = require('tmp')

function atomicWrite(filePath, data, callback) {
  temp.file({mode: 0644, prefix:'lowdb-'}, function(err, path, fd) {
    if (err) throw err;
    fs.writeFile(path, data, function() {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      fs.linkSync(path, filePath);
      fs.unlinkSync(path);

      callback();
    });
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




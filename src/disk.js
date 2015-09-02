var fs = require('graceful-fs')
var steno = require('steno')
var zlib = require('zlib')

module.exports = {
  // No async read
  readSync: function (file, gzip) {
    if (fs.existsSync(file)) {
      var content = fs.readFileSync(file)
      return (gzip ? zlib.inflateSync(content) : content).toString('utf8')
    }
  },

  write: function (file, data, gzip) {
    if (gzip) data = zlib.deflateSync(new Buffer(data))
    steno.writeFile(file, data, function (err) {
      if (err) throw err
    })
  },

  writeSync: function (file, data, gzip) {
    if (gzip) data = zlib.deflateSync(new Buffer(data))
    steno.writeFileSync(file, data)
  }
}

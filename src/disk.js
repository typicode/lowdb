var fs = require('graceful-fs')
var steno = require('steno')

module.exports = {
  read: function (file) {
    if (fs.existsSync(file)) {
      return fs.readFileSync(file, 'utf-8')
    }
  },

  write: function (file, data) {
    steno.writeFile(file, data, function (err) {
      if (err) throw err
    })
  },

  writeSync: function (file, data) {
    steno.writeFileSync(file, data)
  }
}

var fs = require('fs')
var path = require('path')
var _ = require('lodash')
var steno = require('steno')
var crypto = require('crypto')
var algorithm = 'aes256'

function getTempFile(file) {
  return path.join(
    path.dirname(file),
    '.' + path.basename(file) + '~'
  )
}

module.exports = {
  // Compose every function with fn
  composeAll: function (obj, fn) {
    for (var key in obj) {
      if (_.isFunction(obj[key])) {
        obj[key] = _.compose(fn, obj[key])
      }
    }
  },

  // Read or create file and return object
  // If no file is provided return an empty object
  getObject: function (file, parse, options) {
    if (file) {
      if (fs.existsSync(file)) {

        var dbData = fs.readFileSync(file)

        if(options.encrypt){

          var decipher = crypto.createDecipher(algorithm, options.passkey)
          dbData = decipher.update(dbData, 'hex', 'utf8') + decipher.final('utf8')
        }

        return parse(dbData)
      } else {
        fs.writeFileSync(file, '{}')
        return {}
      }
    } else {
      return {}
    }
  },

  saveAsync: function(file, data) {
    steno(getTempFile(file)).setCallback(function(err, data, next) {
      if (err) throw err
      fs.rename(this.filename, file, function(err) {
        if (err) throw err
        next()
      })
    })
    steno(getTempFile(file)).write(data)
  },

  saveSync: function(file, data) {
    fs.writeFileSync(getTempFile(file), data)
    fs.renameSync(getTempFile(file), file)
  }
}

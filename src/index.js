var fs = require('fs')
var _ = require('lodash')
var utils = require('./utils')
var crypto = require('crypto')

var algorithm = 'aes256'

function low(file, options) {

  var options = _.assign({
    autosave: true,
    async: true,
    encrypt: false,
    passkey: ""
  }, options)

  var obj = utils.getObject(file, low.parse, options)

  function db(key) {
    var array = obj[key] = obj[key] || []
    var chain = _.chain(array)

    if (file && options.autosave) {
      var save = function() {
        options.async ? db.save() : db.saveSync()
      }

      utils.composeAll(chain, function(arg) {
        save()
        return arg
      })

      save()
    }

    return chain
  }


  db.save = function(f) {
    f = f ? f : file

    var dbData = low.stringify(obj)

    if(options.encrypt){

      if(options.passkey.length == 0){
        throw new Error('Please setup a passkey for AES 256 encryption')
      }

      var cipher = crypto.createCipher(algorithm, options.passkey)
      dbData = cipher.update(low.stringify(obj), 'utf8', 'hex') + cipher.final('hex');
    }

    utils.saveAsync(file, dbData)

  }

  db.saveSync = function(f) {
    f = f ? f : file

    var dbData = low.stringify(obj)

    if(options.encrypt){
      var cipher = crypto.createCipher(algorithm, options.passkey)
      dbData = cipher.update(low.stringify(obj), 'utf8', 'hex') + cipher.final('hex');
    }

    utils.saveSync(file, dbData)
  }

  db.object = obj

  return db
}

low.mixin = function(arg) {
  _.mixin(arg)
}

low.stringify = function(obj) {
  return JSON.stringify(obj, null, 2)
}

low.parse = function(str) {
  return JSON.parse(str)
}

module.exports = low

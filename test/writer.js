var fs = require('graceful-fs')
var assert = require('assert')
var temp = require('tmp')
var Writer = require('../src/writer')
var path = require('path')

describe('Writer', function() {

  // Sometime Travis can be slow...
  this.timeout(20 * 1000)

  var filePath;

  before(function() {
    temp.setGracefulCleanup();
    temp.tmpName({prefix: 'test', postfix: '.txt', dir: '/tmp', keep: true}, function(err, path) {
      if (err) throw err;
      filePath = path;
    })
  })

  it('always writes data from the latest call', function(done) {
    var writer = new Writer(filePath)

    // 1M characters
    var data = ''
    for (var i = 0; i <= 1000 * 1000; i++) {
      data += 'x'
    }

    for (var i = 0; i <= 1000 * 1000; i++) {
      writer.write(data + i)
    }

    setTimeout(function() {
      assert.equal(fs.readFileSync(filePath, 'utf-8'), data + (i - 1))
      done()
    }, 1000)
  })

})
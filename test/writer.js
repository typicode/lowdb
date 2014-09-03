var fs = require('fs')
var assert = require('assert')
var rmrf = require('rimraf')
var Writer = require('../src/writer')

describe('Writer', function() {

  this.timeout(10000)

  var tempPath = __dirname + '/../tmp'
  var filePath = tempPath + '/../tmp/test.txt'

  beforeEach(function() {
    rmrf.sync(tempPath)
    fs.mkdirSync(tempPath)
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
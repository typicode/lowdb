var fs = require('fs')
var assert = require('assert')
var rmrf = require('rimraf')
var low = require('../src')

var tempDir = __dirname + '/../tmp'
var syncFile = tempDir + '/sync.json'
var asyncFile = tempDir + '/async.json'

describe('LowDB', function() {

  var db

  beforeEach(function() {
    rmrf.sync(tempDir)
    fs.mkdirSync(tempDir)
  })

  describe('CRUD', function() {

    beforeEach(function() {
      db = low()
    })

    it('creates', function() {
      db('foo').push({ a: 1 })
      assert.equal(db('foo').size(), 1)
    })

    it('reads', function() {
      db('foo').push({ a: 1 })
      assert.deepEqual(db('foo').find({ a: 1 }).value(), { a: 1 })
    })

    it('updates', function() {
      db('foo').push({ a: 1 })
      db('foo').find({ a: 1 }).assign({ a: 2 })
      assert(!db('foo').find({ a: 2 }).isUndefined().value())
    })

    it('deletes', function() {
      db('foo').push({ a: 1 })
      db('foo').remove({ a: 1 })
      assert(db('foo').isEmpty().value())
    })

  })

  describe('Async', function() {

    beforeEach(function() {
      db = low(asyncFile)
    })

    describe('Autosave', function() {
      beforeEach(function(done) {
        db('foo').push({ a: 1 })
        setTimeout(done, 10)
      })

      it('saves automatically to file', function(done) {
        assert.deepEqual(
          db('foo').value(),
          JSON.parse(fs.readFileSync(asyncFile)).foo
        )
        setTimeout(done, 10)
      })
    })

    describe('#save()', function() {
      beforeEach(function(done) {
        db.object.foo = [ { a: 1 } ]
        db.save()
        setTimeout(done, 10)
      })

      it('saves database', function(done) {
        assert.deepEqual(JSON.parse(fs.readFileSync(asyncFile)), db.object)
        setTimeout(done, 10)
      })
    })

  })

  describe('sync', function() {

    var file1 = 'tmp/tmp-1.json';
    var file2 = 'tmp/tmp-2.json';

    beforeEach(function() {
      fs.writeFileSync(syncFile, JSON.stringify({ foo: { a: 1 } }))
      db = low(syncFile, { async: false })
    });

    afterEach(function() {
      if (fs.existsSync(file1)) {
        fs.unlinkSync(file1);
      }
      if (fs.existsSync(file2)) {
        fs.unlinkSync(file2);
      }
    });

    describe('Autoload', function() {
      it('loads automatically file', function() {
        assert.equal(db('foo').value().a, 1)
      })
    })

    describe('Autosave', function() {
      beforeEach(function() {
        db('foo').push({ a: 1 })
      })

      it('saves automatically to file', function() {
        assert.deepEqual(
          db('foo').value(),
          JSON.parse(fs.readFileSync(syncFile)).foo
        )
      })
    })

    describe('#saveSync()', function() {
      beforeEach(function() {
        db.object.foo = [ { a: 1 } ]
        db.saveSync()
      })

      it('saves database', function() {
        assert.deepEqual(JSON.parse(fs.readFileSync(syncFile)), db.object)
      })
    })

    describe('#saveSync(... with filename ...)', function() {
      it('should write a different file from the initial db file specified.', function() {
        db = low(file1, { async: false });
        db('file-names').push({name:'first'});
        db.saveSync();

        assert(fs.existsSync(file1));

        db.saveSync(file2);
        assert(fs.existsSync(file2));
      })

    });

  })

  describe('mixin', function() {

    beforeEach(function() {
      low.mixin({
        hello: function(array, word) {
          array.push('hello ' + word)
        }
      })
      db = low(syncFile, { async: false })
    })

    it('adds functions', function() {
      db('foo').hello('world')
      assert.deepEqual(JSON.parse(fs.readFileSync(syncFile)), { foo: [ 'hello world' ] })
    })

  })

  describe('stringify and parse', function() {

    var stringify = low.stringify
    var parse = low.parse

    beforeEach(function() {
      low.stringify = function() { return '{ "foo": [] }' }
      low.parse = function() { return { bar: [] } }
      fs.writeFileSync(syncFile, '{}')
      db = low(syncFile, { async: false })
    })

    afterEach(function() {
      low.stringify = stringify
      low.parse = parse
    })

    it('can be overriden', function() {
      assert.deepEqual(db.object, { bar: [] })
      db.saveSync() // will stringify object
      assert.equal(fs.readFileSync(syncFile, 'utf-8'), '{ "foo": [] }')
    })

  })
})

describe('underscore-db', function() {

  beforeEach(function() {
    low.mixin(require('underscore-db'))
    db = low(syncFile)
  })

  it('is supported', function() {
    var id = db('foo').insert({ a: 1 }).value().id
    assert(db('foo').get(id).value().a, 1)
  })

})

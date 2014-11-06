var fs = require('fs')
var assert = require('assert')
var rmrf = require('rimraf')
var low = require('../src')

var tempPath = __dirname + '/../tmp'
var dbPath = tempPath + '/test.json'

describe('LowDB', function() {

  var db

  beforeEach(function() {
    rmrf.sync(tempPath)
    fs.mkdirSync(tempPath)
  })

  describe('Basic operations', function() {

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

  describe('Async autosave', function() {

    beforeEach(function(done) {
      db = low(dbPath)
      db('foo').push({ a: 1 })
      setTimeout(done, 100)
    })

    it('saves automatically to file', function() {
      assert.deepEqual(
        db('foo').value(),
        JSON.parse(fs.readFileSync(dbPath)).foo
      )
    })

  })

  describe('Sync autosave', function() {
    beforeEach(function() {
      db = low.sync(dbPath)
      db('foo').push({ a: 1 })
    })

    it('saves automatically to file', function() {
      assert.deepEqual(
        db('foo').value(),
        JSON.parse(fs.readFileSync(dbPath)).foo
      )
    })
  })

  describe('Autoload', function() {

    beforeEach(function() {
      fs.writeFileSync(dbPath, JSON.stringify({ foo: { a: 1 } }))
      db = low(dbPath)
    })

    it('loads automatically file', function() {
      assert.equal(db('foo').value().a, 1)
    })

  })

  describe('In-memory', function() {

    beforeEach(function() {
      db = low()
    })

    it('doesn\'t create a file', function() {
      assert(!fs.existsSync(dbPath))
    })

    it('supports Lo-Dash methods', function() {
      db('foo').push({ a: 1 })
      assert(!db('foo').find({ a: 1 }).isUndefined().value())
    })

  })

  describe('Async save', function() {

    beforeEach(function(done) {
      db = low(dbPath)
      db.object.foo = [ { a: 1 } ]
      db.save()
      setTimeout(done, 100)
    })

    it('saves database', function() {
      assert.deepEqual(JSON.parse(fs.readFileSync(dbPath)), db.object)
    })

  })

  describe('Sync save', function() {

    beforeEach(function() {
      db = low.sync(dbPath)
      db.object.foo = [ { a: 1 } ]
      db.save()
    })

    it('saves database', function() {
      assert.deepEqual(JSON.parse(fs.readFileSync(dbPath)), db.object)
    })

  })

  describe('mixin', function() {

    beforeEach(function() {
      db = low(dbPath)
      low.mixin({
        hello: function(array, word) {
          array.push('hello ' + word)
        }
      })
    })

    it('adds functions', function(done) {
      db('foo').hello('world')
      setTimeout(function() {
        assert.deepEqual(JSON.parse(fs.readFileSync(dbPath)), { foo: [ 'hello world' ] })
        done()
      }, 100)
    })

  })

  describe('stringify and parse', function() {

    var stringify = low.stringify
    var parse = low.parse

    beforeEach(function() {
      low.stringify = function() { return '{ "foo": [] }' }
      low.parse = function() { return { bar: [] } }
      fs.writeFileSync(dbPath, '{}')
      db = low(dbPath)
    })

    afterEach(function() {
      low.stringify = stringify
      low.parse = parse
    })

    it('can be overriden', function(done) {
      assert.deepEqual(db.object, { bar: [] })
      db.save() // will stringify object
      setTimeout(function() {
        assert.equal(fs.readFileSync(dbPath, 'utf-8'), '{ "foo": [] }')
        done()
      }, 100)
    })

  })
})

describe('underscore-db', function() {

  beforeEach(function() {
    low.mixin(require('underscore-db'))
    db = low(dbPath)
  })

  it('is supported', function() {
    var id = db('foo').insert({ a: 1 }).value().id
    assert(db('foo').get(id).value().a, 1)
  })

})

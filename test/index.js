var fs = require('fs')
var assert = require('assert')
var sinon = require('sinon')
var rmrf = require('rimraf')
var low = require('../src')
var disk = require('../src/disk')

/* global beforeEach, afterEach, describe, it */

var tempDir = __dirname + '/../tmp'
var syncFile = tempDir + '/sync.json'
var asyncFile = tempDir + '/async.json'

describe('LowDB', function () {

  var db

  beforeEach(function () {
    rmrf.sync(tempDir)
    fs.mkdirSync(tempDir)
  })

  describe('CRUD', function () {

    beforeEach(function () {
      db = low()
    })

    it('creates', function () {
      db('foo').push({ a: 1 })
      assert.equal(db('foo').size(), 1)
      assert.deepEqual(db.object, { foo: [{ a: 1 }]})
    })

    it('reads', function () {
      db('foo').push({ a: 1 })
      assert.deepEqual(db('foo').find({ a: 1 }), { a: 1 })
    })

    it('updates', function () {
      db('foo').push({ a: 1 })
      db('foo')
        .chain()
        .find({ a: 1 })
        .assign({ a: 2 })
        .value()
      assert(!db('foo').chain().find({ a: 2 }).isUndefined().value())
    })

    it('deletes', function () {
      db('foo').push({ a: 1 })
      db('foo').remove({ a: 1 })
      assert(db('foo').isEmpty())
    })

  })

  describe('Async', function () {

    beforeEach(function () {
      db = low(asyncFile)
    })

    // Since it's async need to wait between each test

    describe('Autosave', function () {
      beforeEach(function (done) {
        db('foo').push({ a: 1 })
        setTimeout(done, 10)
      })

      it('saves automatically to file', function (done) {
        assert.deepEqual(
          JSON.parse(fs.readFileSync(asyncFile)),
          { foo: [{ a: 1 }] }
        )
        setTimeout(done, 10)
      })
    })

    describe('#save()', function () {
      beforeEach(function (done) {
        db.object.foo = [ { a: 1 } ]
        db.save()
        setTimeout(done, 10)
      })

      it('saves database', function (done) {
        assert.deepEqual(
          JSON.parse(fs.readFileSync(asyncFile)),
          { foo: [{ a: 1 }] }
        )
        setTimeout(done, 10)
      })
    })

  })

  describe('sync', function () {

    beforeEach(function () {
      fs.writeFileSync(syncFile, JSON.stringify({ foo: [{ a: 1 }] }))
      db = low(syncFile, { async: false })
    })

    describe('Autoload', function () {
      it('loads automatically file', function () {
        assert.deepEqual(db('foo').value(), [{ a: 1 }])
      })
    })

    describe('Autosave with short syntax', function () {
      beforeEach(function () {
        db('foo').push({ b: 2 })
      })

      it('saves automatically to file', function () {
        assert.deepEqual(
          JSON.parse(fs.readFileSync(syncFile)),
          { foo: [{ a: 1 }, { b: 2 }] }
        )
      })
    })

    describe('Autosave with chain syntax', function () {
      beforeEach(function () {
        db('foo').chain().push({ b: 2 }).value()
      })

      it('saves automatically to file', function () {
        assert.deepEqual(
          JSON.parse(fs.readFileSync(syncFile)),
          { foo: [{ a: 1 }, { b: 2 }] }
        )
      })
    })

    describe('Autosave checksum', function () {

      it('writes to disk only if db.object has changed', function () {
        var spy = sinon.spy(disk, 'writeSync')
        var songs = db('songs')
        assert(spy.calledOnce)
        spy.reset()

        songs.find()
        assert(!spy.calledOnce)
        spy.reset()

        songs.push({ a: 1 })
        assert(spy.calledOnce)
        spy.reset()

        songs.chain().push({ a: 1}).value()
        assert(spy.calledOnce)
      })

    })

    describe('#saveSync()', function () {
      beforeEach(function () {
        db.object.foo = [ { b: 2 } ]
        db.saveSync()
      })

      it('saves database', function () {
        assert.deepEqual(
          JSON.parse(fs.readFileSync(syncFile)),
          { foo: [{ b: 2 }] }
        )
      })

      it('saves to another file if a parameter is provided', function () {
        var copy = tempDir + '/copy.json'
        db.saveSync(copy)
        assert(fs.existsSync(copy))
        assert(fs.readFileSync(copy), fs.readFileSync(syncFile))
      })
    })

  })

  describe('mixin', function () {

    beforeEach(function () {
      low.mixin({
        hello: function (array, word) {
          array.push('hello ' + word)
        }
      })
      db = low(syncFile, { async: false })
    })

    it('adds functions', function () {
      db('foo').hello('world')
      assert.deepEqual(JSON.parse(fs.readFileSync(syncFile)), { foo: [ 'hello world' ] })
    })

  })

  describe('stringify and parse', function () {

    var stringify = low.stringify
    var parse = low.parse

    beforeEach(function () {
      low.stringify = function () { return '{ "foo": [] }' }
      low.parse = function () { return { bar: [] } }
      fs.writeFileSync(syncFile, '{}')
      db = low(syncFile, { async: false })
    })

    afterEach(function () {
      low.stringify = stringify
      low.parse = parse
    })

    it('can be overriden', function () {
      assert.deepEqual(db.object, { bar: [] })
      db.saveSync() // will stringify object
      assert.equal(fs.readFileSync(syncFile, 'utf-8'), '{ "foo": [] }')
    })

  })

  describe('empty database', function () {

    it('loads an empty file', function () {
      fs.writeFileSync(syncFile, '')
      assert.doesNotThrow(low(syncFile, { async: false }))
    })

    it('loads a file with whitespaces', function () {
      fs.writeFileSync(syncFile, '\n\t ')
      assert.doesNotThrow(low(syncFile, { async: false }))
    })

  })
})

describe('underscore-db', function () {

  var db

  beforeEach(function () {
    low.mixin(require('underscore-db'))
    db = low(syncFile)
  })

  it('is supported', function () {
    var id = db('foo').insert({ a: 1 }).id
    assert(db('foo').getById(id).a, 1)
  })

})

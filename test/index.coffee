fs     = require 'fs'
assert = require 'assert'
sinon  = require 'sinon'
_      = require 'lodash'
low    = require '../src'

sinon.spy low.ee, 'emit'
sinon.stub fs, 'writeFileSync'
sinon.stub(fs, 'readFileSync').returns('{}')

insertSong = ->
  low('songs').insert(title: 'foo').value()

describe 'low', ->

  beforeEach ->
    low.db = {}
    low.ee.emit.reset()

  it 'create', ->
    assert.deepEqual low('songs').value(), []
    assert.deepEqual low.db, songs: []

  it 'insert', ->
    song = insertSong()

    assert low.ee.emit.calledWith('add', 'songs', song)
    assert low('songs').size(), 1

  it 'get', ->
    song = insertSong()

    assert low('songs').get song.id

  it 'update', ->
    previousSong = _.clone insertSong()
    updatedSong  = low('songs').update(previousSong.id, title: 'bar').value()

    assert low.ee.emit.calledWith('update', 'songs', updatedSong, previousSong)

    low.ee.emit.reset()
    low('songs').update 9999, {}
    assert not low.ee.emit.called

  it 'updateWhere', ->
    previousSong = _.clone insertSong()
    updatedSongs = low('songs').updateWhere(title: 'foo', {}).value()

    assert low.ee.emit.calledWith('update', 'songs', updatedSongs,
    [previousSong])

    low.ee.emit.reset()
    low('songs').updateWhere title: 'qux', {}
    assert not low.ee.emit.called

  it 'remove', ->
    song = insertSong()
    low('songs').remove song.id

    assert low.ee.emit.calledWith('remove', 'songs', song)
    assert.equal low('songs').size(), 0

    low.ee.emit.reset()
    low('songs').remove 9999, {}
    assert not low.ee.emit.called

  it 'removeWhere', ->
    song = insertSong()
    low('songs').removeWhere title: 'foo'

    assert low.ee.emit.calledWith('remove', 'songs', [song])
    assert.equal low('songs').size(), 0

    low.ee.emit.reset()
    low('songs').removeWhere title: 'qux'
    assert not low.ee.emit.called

  it 'load', ->
    low.load()
    assert fs.readFileSync.calledWith('db.json')

    low.load('bar.json')
    assert fs.readFileSync.calledWith('bar.json')

  it 'save', ->
    insertSong()
    assert fs.writeFileSync.calledWith('db.json')

    low.save()
    assert fs.writeFileSync.calledWith('db.json')

    low.save 'bar.json'
    assert fs.writeFileSync.calledWith('bar.json')

  it 'index', ->
    song = insertSong()

    assert.equal low.db['songs'][0].title, 'foo'
    assert.equal low.db['songs']._index[song.id].title, 'foo'
    assert.equal low('songs').get(song.id).value().title, 'foo'

    low('songs').update song.id, title: 'bar'

    assert.equal low.db['songs'][0].title, 'bar'
    assert.equal low.db['songs']._index[song.id].title, 'bar'
    assert.equal low('songs').get(song.id).value().title, 'bar'

    low('songs').remove song.id

    assert.equal low.db['songs'].length, 0
    assert.equal Object.keys(low.db['songs']._index).length, 0

  it 'emits change on add, update, remove', ->
    spy = sinon.spy()
    low.on 'change', spy

    for e in ['add', 'update', 'remove']
      low.ee.emit e, 'songs', {} # empty doc
      assert spy.called
      spy.reset()

describe 'short syntax', ->

  beforeEach ->
    low.db = {}
    @song = insertSong()

  it 'get', ->
    assert.deepEqual low('songs', @song.id),
                     low('songs').get(@song.id).value()

  it 'where', ->
    assert.deepEqual low('songs', title: 'foo'),
                     low('songs').where(title: 'foo').value()

  it 'remove', ->
    assert.deepEqual low('songs', @song.id, -1), @song
    assert.equal low('songs').size(), 0

  it 'create', ->
    newSong = low 'songs', title: 'bar', 1
    assert.deepEqual low('songs').get(newSong.id).value(), newSong
    assert.equal low('songs').size(), 2

  it 'updateWhere', ->
    low 'songs', {title: 'foo'}, {title: 'bar'}
    assert low('songs').find title: 'bar'

  it 'removeWhere', ->
    low 'songs', title: 'foo', -1
    assert.equal low('songs').size(), 0

describe 'options', ->

  it 'has a path option', ->
    low.path = 'somefile.json'

    fs.writeFileSync.reset()
    low.save()
    assert fs.writeFileSync.calledWith('somefile.json')

    fs.writeFileSync.reset()
    low.load()
    assert fs.readFileSync.calledWith('somefile.json')

  it 'has an autoSave option', ->
    low.autoSave = false

    fs.writeFileSync.reset()
    insertSong()
    assert not fs.writeFileSync.called

    low.save()
    assert fs.writeFileSync.called

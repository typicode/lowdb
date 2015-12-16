const test = require('tape')
const sinon = require('sinon')
const tempfile = require('tempfile')
const fileSync = require('../src/file-sync')

const obj = { a: 1 }

test('file-sync', t => {
  const filename = tempfile()

  t.same(
    fileSync.read(filename),
    {}
  )

  fileSync.write(filename, obj)
  t.same(
    fileSync.read(filename),
    obj
  )

  t.end()
})

test('serializer/deserializer', t => {
  const filename = tempfile()
  const stringify = sinon.spy(JSON.stringify)
  const parse = sinon.spy(JSON.parse)

  fileSync.write(filename, obj, stringify)
  t.same(
    fileSync.read(filename, parse),
    obj
  )

  t.true(stringify.calledOnce)
  t.true(parse.calledOnce)

  t.end()
})

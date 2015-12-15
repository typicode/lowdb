const test = require('tape')
const sinon = require('sinon')
const tempfile = require('tempfile')
const fileSync = require('../src/file-sync')

const obj = { a: 1 }

test('file-sync', t => {
  t.plan(1)

  const filename = tempfile()

  fileSync.write(filename, obj)
  const actual = fileSync.read(filename)

  t.same(actual, obj)
})

test('serializer/deserializer', t => {
  t.plan(3)

  const filename = tempfile()
  const stringify = sinon.spy(JSON.stringify)
  const parse = sinon.spy(JSON.parse)

  fileSync.write(filename, obj, stringify)
  const actual = fileSync.read(filename, parse)

  t.same(actual, obj)
  t.true(stringify.calledOnce)
  t.true(parse.calledOnce)
})

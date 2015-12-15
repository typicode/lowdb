const test = require('tape')
const sinon = require('sinon')
const tempfile = require('tempfile')
const fileAsync = require('../src/file-async')

const obj = { a: 1 }

test('file-async', t => {
  t.plan(1)

  const filename = tempfile()

  fileAsync
    .write(filename, obj)
    .then(() => {
      const actual = fileAsync.read(filename)
      t.same(actual, obj)
    })
    .catch(t.end)
})

test('serializer/deserializer', t => {
  t.plan(3)

  const filename = tempfile()
  const stringify = sinon.spy(JSON.stringify)
  const parse = sinon.spy(JSON.parse)

  fileAsync
    .write(filename, obj, stringify)
    .then(() => {
      const actual = fileAsync.read(filename, parse)
      t.same(actual, obj)
      t.true(stringify.calledOnce)
      t.true(parse.calledOnce)
    })
    .catch(t.end)
})

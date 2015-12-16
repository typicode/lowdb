const test = require('tape')
const sinon = require('sinon')
const tempfile = require('tempfile')
const fileAsync = require('../src/file-async')

const obj = { a: 1 }

test('file-async', t => {
  const filename = tempfile()

  t.same(
    fileAsync.read(filename),
    {}
  )

  fileAsync
    .write(filename, obj)
    .then(() => {
      const actual = fileAsync.read(filename)
      t.same(actual, obj)
      t.end()
    })
    .catch(t.end)
})

test('serializer/deserializer', t => {
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
      t.end()
    })
    .catch(t.end)
})

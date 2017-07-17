const test = require('tape')
const sinon = require('sinon')
const tempfile = require('tempfile')
const fileAsync = require('../../src/adapters/file-async')

const obj = { a: 1 }

test('file-async', t => {
  const filename = tempfile()

  fileAsync
    .read(filename)
    .then((actual) => {
      t.same(actual, {})
    })
    .then(() => fileAsync.write(filename, obj))
    .then(() => fileAsync.read(filename))
    .then((actual) => {
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
    .then(() => fileAsync.read(filename, parse))
    .then((actual) => {
      t.same(actual, obj)
      t.true(stringify.calledWith(obj))
      t.true(parse.calledOnce)
      t.end()
    })
    .catch(t.end)
})

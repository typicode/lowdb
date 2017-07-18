const test = require('tape')
const sinon = require('sinon')
const tempfile = require('tempfile')
const FileSync = require('../../src/adapters/FileSync')

const obj = { a: 1 }

test('FileSync', t => {
  const file = new FileSync(tempfile())

  t.same(file.read(), {})

  file.write(obj)
  t.same(file.read(), obj)

  t.end()
})

test('serializer/deserializer', t => {
  const serialize = sinon.spy(JSON.stringify)
  const deserialize = sinon.spy(JSON.parse)

  const file = new FileSync(tempfile(), { serialize, deserialize })

  file.write(obj)
  t.same(file.read(), obj)

  t.true(serialize.calledWith(obj))
  t.true(deserialize.calledOnce)

  t.end()
})

const test = require('tape')
const sinon = require('sinon')
const tempfile = require('tempfile')
const FileAsync = require('../../src/adapters/FileAsync')

const obj = { a: 1 }

test('FileAsync', async t => {
  const file = new FileAsync(tempfile())

  try {
    let actual = await file.read()
    t.same(actual, {})

    await file.write(obj)
    actual = await file.read()
    t.same(actual, obj)
    t.end()
  } catch (e) {
    t.end(e)
  }
})

test('serializer/deserializer', async t => {
  const serialize = sinon.spy(JSON.stringify)
  const deserialize = sinon.spy(JSON.parse)

  const file = new FileAsync(tempfile(), { serialize, deserialize })

  try {
    await file.write(obj)
    const actual = await file.read()
    t.same(actual, obj)
    t.true(serialize.calledWith(obj))
    t.true(deserialize.calledOnce)
    t.end()
  } catch (e) {
    t.end(e)
  }
})

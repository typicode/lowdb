const fs = require('fs')
const test = require('tape')
const sinon = require('sinon')
const tempfile = require('tempfile')
const low = require('../src/main')

test('format', (t) => {
  const filename = tempfile()
  const format = {
    serialize: sinon.stub().returns(''),
    deserialize: sinon.stub().returns({})
  }
  fs.writeFileSync(filename, '{}', 'utf-8')
  const db = low(filename, { format })

  db.defaults({ posts: [] })
    .get('posts')
    .push({ title: 'foo' })
    .write()

  t.ok(format.serialize.calledOnce, 'serialize should be called')
  t.ok(format.deserialize.calledOnce, 'deserialize should be called')

  t.end()
})

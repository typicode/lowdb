const fs = require('fs')
const path = require('path')
const test = require('tape')
const sinon = require('sinon')
const tempfile = require('tempfile')
const low = require('../src/index.node')

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
    .value()

  t.ok(format.serialize.called, 'serialize should be called')
  t.ok(format.deserialize.calledOnce, 'deserialize should be called')

  t.end()
})

const fs = require('fs')
const path = require('path')
const test = require('tape')
const tempfile = require('tempfile')
const low = require('../src/index.node')

test('write', (t) => {
  const filename = tempfile()
  const db = low(filename)

  db.defaults({ foo: [] })
    .value()

  db.get('foo')
    .push(1)
    .write()

  const actual = JSON.parse(fs.readFileSync(filename))
  t.same(actual, { foo: [1] })
  t.end()
})

test('read', (t) => {
  const filename = path.join(__dirname, 'fixtures/db.json')
  const db = low(filename)
  t.same(db.getState(), { foo: [1] })
  t.end()
})

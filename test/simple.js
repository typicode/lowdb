const fs = require('fs')
const path = require('path')
const test = require('tape')
const tempfile = require('tempfile')
const low = require('../src')
const storage = require('../src/file-sync')

test('write', (t) => {
  const filename = tempfile()
  const db = low(filename, { storage })

  db('foo').push(1)

  const actual = JSON.parse(fs.readFileSync(filename))
  t.same(actual, { foo: [1] })
  t.end()
})

test('read', (t) => {
  const filename = path.join(__dirname, 'fixtures/db.json')
  const db = low(filename, { storage })
  t.same(db.object, { foo: [1] })
  t.end()
})

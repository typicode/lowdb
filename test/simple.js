const fs = require('fs')
const test = require('tape')
const tempfile = require('tempfile')
const low = require('../src')
const storage = require('../src/file-sync')

const filename = tempfile()
const db = low(filename, { storage })

test('simple', (t) => {
  db('numbers').push(1)
  const actual = JSON.parse(fs.readFileSync(filename))
  t.same(actual, { numbers: [1] })
  t.end()
})

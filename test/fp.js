const fs = require('fs')
const test = require('tape')
const tempfile = require('tempfile')
const fp = require('lodash/fp')
const R = require('ramda')
const low = require('../src/fp')
const FileSync = require('../src/adapters/FileSync')

test('fp + lodash/fp', (t) => {
  const filename = tempfile()
  const db = low(new FileSync(filename))

  const posts = db('posts', [])

  t.same(posts(fp.concat(1)), [1], 'should return a new array')
  t.same(db.getState(), {}, 'shouldn\'t change state')

  t.same(posts([fp.concat(1), fp.concat(2)]), [2, 1], 'should return a new array')

  posts.write(fp.concat(1))
  t.same(db.getState(), { posts: [1] }, 'should change state')

  const actual = JSON.parse(fs.readFileSync(filename))
  t.same(actual, { posts: [1] })
  t.end()
})

test('fp + ramda', (t) => {
  const filename = tempfile()
  const db = low(new FileSync(filename))

  const posts = db('posts', [])

  t.same(posts(R.concat([1])), [1], 'should return a new array')
  t.same(db.getState(), {}, 'shouldn\'t change state')

  posts.write(R.concat([1]))
  t.same(db.getState(), { posts: [1] }, 'should change state')

  const actual = JSON.parse(fs.readFileSync(filename))
  t.same(actual, { posts: [1] })
  t.end()
})

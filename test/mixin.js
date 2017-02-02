const test = require('tape')
const underscoreDB = require('underscore-db')
const low = require('../src/main')

test('mixin', t => {
  const db = low()

  db._.mixin({
    hello: (array, word) => array.push('hello ' + word)
  })

  db.set('msg', [])
    .get('msg')
    .hello('world')
    .write()

  t.same(db.getState().msg, [ 'hello world' ])

  t.end()
})

test('underscore-db mixin', t => {
  const db = low()
  db.defaults({ posts: [] }).value()

  db._.mixin(underscoreDB)
  db._.id = '_id'

  const posts = db.get('posts')

  // Get _id value
  const id = posts
    .insert({ title: 'test' })
    .write()
    ._id

  const post = db.get('posts')
    .getById(id)
    .value()

  t.notEqual(post, undefined)

  t.end()
})

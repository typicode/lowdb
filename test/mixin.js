const test = require('tape')
const low = require('../src')

test('mixin', t => {
  let db = low()
  db._.mixin({ hello: (array, word) => array.push('hello ' + word) })
  db('msg').hello('world')
  t.same(db.object.msg, [ 'hello world' ])
  t.end()
})

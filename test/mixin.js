const test = require('tape')
const low = require('../src')

test('mixin', t => {
  const db = low(undefined, {
    mixin: {
      hello: (array, word) => array.push('hello ' + word)
    }
  })

  db.set('msg', [])
    .get('msg')
    .hello('world')
    .value()

  t.same(db.getObject().msg, [ 'hello world' ])

  t.end()
})

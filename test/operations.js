const test = require('tape')
const low = require('../src')

test('operations', t => {
  const db = low()

  // Create
  db('foo').push({ a: 1 })
  t.equal(db('foo').size(), 1)
  t.same(db.object, { foo: [{ a: 1 }]})

  // Read
  t.same(db('foo').find({ a: 1 }), { a: 1 })
  t.same(db('foo').find({ b: 2}), undefined)

  // Update
  db('foo')
    .chain()
    .find({ a: 1 })
    .assign({ a: 2 })
    .value()

  t.true(
    !db('foo')
      .chain()
      .find({ a: 2 })
      .isUndefined()
      .value()
  )

  // Delete
  db('foo').remove({ a: 2 })
  t.true(db('foo').isEmpty())

  t.end()
})

test('Issue #89', t => {
  const db = low()
  db('foo').push({ id: 1, value: 1})

  t.equal(db('foo').find({ id: 1 }).value, 1)
  t.deepEqual(db('foo').find({ id: 1 }), { id: 1, value: 1})

  t.end()
})

const test = require('tape')
const low = require('../src')

test('operations', t => {
  const db = low()

  // Defaults
  db.defaults({
    foo: []
  }).value()

  // Create
  db.get('foo').push({ a: 1 }).value()
  t.equal(db.get('foo').size().value(), 1)
  t.same(db.state(), { foo: [{ a: 1 }]})

  // Read
  t.same(db.get('foo').find({ a: 1 }).value(), { a: 1 })
  t.same(db.get('foo').find({ b: 2 }).value(), undefined)

  // Update
  db.get('foo')
    .find({ a: 1 })
    .assign({ a: 2 })
    .value()

  t.true(
    !db.get('foo')
      .find({ a: 2 })
      .isUndefined()
      .value()
  )

  // Delete
  db.get('foo').remove({ a: 2 }).value()
  t.true(db.get('foo').isEmpty())

  t.end()
})

test('Issue #89', t => {
  const db = low()

  db.defaults({
    foo: []
  }).value()

  db.get('foo').push({ id: 1, value: 1}).value()

  t.equal(db.get('foo').find({ id: 1 }).value().value, 1)
  t.deepEqual(db.get('foo').find({ id: 1 }).value(), { id: 1, value: 1})

  t.end()
})

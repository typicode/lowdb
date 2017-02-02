const test = require('tape')
const low = require('../src/main')

test('operations', t => {
  const db = low()

  // Defaults
  db.defaults({ foo: [] }).write()

  // Create
  db.get('foo').push({ a: 1 }).write()
  t.equal(db.get('foo').size().value(), 1)
  t.same(db.getState(), { foo: [{ a: 1 }] })

  // Read
  t.same(db.get('foo').find({ a: 1 }).value(), { a: 1 })
  t.same(db.get('foo').find({ b: 2 }).value(), undefined)

  // Update
  db.get('foo')
    .find({ a: 1 })
    .assign({ a: 2 })
    .write()

  t.true(
    !db.get('foo')
      .find({ a: 2 })
      .isUndefined()
      .value()
  )

  // Delete
  db.get('foo').remove({ a: 2 }).write()
  t.true(db.get('foo').isEmpty())

  t.end()
})

test('Issue #89', t => {
  const db = low()

  db.defaults({ foo: [] }).write()

  db.get('foo').push({ id: 1, value: 1 }).write()

  t.equal(db.get('foo').find({ id: 1 }).value().value, 1)
  t.deepEqual(db.get('foo').find({ id: 1 }).value(), { id: 1, value: 1 })

  t.end()
})

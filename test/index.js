const test = require('tape')
const sinon = require('sinon')
const low = require('../src/main')

const _test = (str, adapter) => {
  test(str, async function (t) {
    try {
      let db
      let count = 0

      if (adapter) {
        db = await low(adapter)
      } else {
        db = low()
      }

      db.defaults({ users: [] })
        .value()

      const users = db.get('users')

      // Add user
      let foo = await users.push('foo').write()[0]

      t.is(foo, 'foo')
      t.is(users.size().value(), 1, 'should add user')

      // Add something to undefined array
      const result = await db.get('unknown').push(1).write()
      t.is(result, undefined)

      count += 2
      t.is(adapter.write.callCount, count, 'should write after db.write()')

      // assert write result
      t.same(db.write(), db.getState(), 'should return db.getState()')

      // read
      await db.read()

      t.is(adapter.read.callCount, 2)

      t.end()
    } catch (err) {
      console.error(err)
      t.end(err)
    }
  })
}

// _test('in-memory')

class Sync {
  constructor() {
    this.read = sinon.spy(() => ({}))
    this.write = sinon.spy()
  }
}
_test('sync', new Sync())

class Async {
  constructor() {
    this.read = sinon.spy(() => Promise.resolve({}))
    this.write = sinon.spy(() => Promise.resolve())
  }
}
_test('promises', new Async())
const test = require('tape')
const sinon = require('sinon')
const low = require('../src/index.node')

const _test = (str, { source, read, write, promise, writeOnChange } = {}) => {
  test(str, async function (t) {
    try {
      let db
      let count

      if (source) {
        if (writeOnChange) {
          // Test that writeOnChange is true by default
          db = promise
            ? await low(source, { storage: { read, write }})
            : low(source, { storage: { read, write }})
        } else {
          db = promise
            ? await low(source, { storage: { read, write }, writeOnChange })
            : low(source, { storage: { read, write }, writeOnChange })
        }

      } else {
        db = low()
      }

      db.defaults({
        users: []
      }).value()

      let users = db.get('users')

      // db('').value() should always return a value (Fix #82)
      if (promise) t.deepEqual(users.value(), [])

      // Add user
      let [ foo ] = users.push('foo').value()

      t.is(foo, 'foo')
      t.is(users.value().length, 1, 'should add user')

      if (write) {
        count = writeOnChange ? 2 : 0
        t.is(write.callCount, count, 'should auto write')
      }

      if (write) {
        db.setState({})

        // Should automatically write new state
        count = writeOnChange ? 3 : 0
        t.is(write.callCount, count, 'should auto write after setState()')

        // write dest
        promise
          ? await db.write('backup.json')
          : db.write('backup.json')

        // get last write call
        let args = write.args.slice(-1)[0]
        t.same(args, ['backup.json', {}, undefined], 'should write to backup.json')
      }

      if (read) {
        // read
        promise
          ? await db.read()
          : db.read()

        t.is(read.callCount, 2)

        promise
          ? await db.read('backup.json')
          : db.read('backup.json')

        let args = read.args.slice(-1)[0]
        t.same(args, ['backup.json', undefined], 'should read from backup.json')
      }

      t.end()
    } catch (err) {
      t.end(err)
    }
  })
}

_test('in-memory')
_test('sync', {
  source: 'db.json',
  read: sinon.spy(() => ({})),
  write: sinon.spy(),
  writeOnChange: true
})
_test('promises', {
  source: 'db.json',
  read: sinon.spy(() => Promise.resolve({})),
  write: sinon.spy(() => Promise.resolve()),
  promise: true,
  writeOnChange: true
})
_test('read-only', {
  source: 'db.json',
  read: sinon.spy(() => ({})),
  writeOnChange: true
})
_test('write-only', {
  source: 'db.json',
  write: sinon.spy(),
  writeOnChange: true
})
_test('writeOnChange = false', {
  source: 'db.json',
  write: sinon.spy(),
  writeOnChange: false
})

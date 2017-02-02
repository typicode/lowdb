const test = require('tape')
const sinon = require('sinon')
const low = require('../src/main')

const _test = (str, { source, read, write } = {}) => {
  test(str, async function (t) {
    try {
      let db
      let count = 0

      if (source) {
        db = await low(source, { storage: { read, write } })
      } else {
        db = low()
      }

      db.defaults({ users: [] })
        .value()

      const users = db.get('users')

      // Add user
      let [ foo ] = await users.push('foo').write()

      t.is(foo, 'foo')
      t.is(users.size().value(), 1, 'should add user')

      if (write) {
        count += 1
        t.is(write.callCount, count, 'should write after db.write()')
      }

      if (write) {
        db.setState({})

        // Should automatically write new state
        count += 1
        t.is(write.callCount, count, 'should write after db.setState()')

        // write dest
        const writeValue = await db.write('backup.json')

        // get last write call
        const args = write.args.slice(-1)[0]
        t.same(args, ['backup.json', {}, undefined], 'should write to backup.json')

        // assert write result
        t.same(writeValue, db.getState(), 'should return db.getState()')
      }

      if (read) {
        // read
        await db.read()

        t.is(read.callCount, 2)

        await db.read('backup.json')

        const args = read.args.slice(-1)[0]
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
  write: sinon.spy()
})

_test('promises', {
  source: 'db.json',
  read: sinon.spy(() => Promise.resolve({})),
  write: sinon.spy(() => Promise.resolve())
})

_test('read-only', {
  source: 'db.json',
  read: sinon.spy(() => ({}))
})

_test('write-only', {
  source: 'db.json',
  write: sinon.spy()
})

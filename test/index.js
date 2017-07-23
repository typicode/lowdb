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
      let [foo] = await users.push('foo').write()

      t.is(foo, 'foo')
      t.is(users.size().value(), 1, 'should add user')

      // Add something to undefined array
      const result = await db.get('unknown').push(1).write()
      t.is(result, undefined)

      if (write) {
        count += 2
        t.is(write.callCount, count, 'should write after db.write()')

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

class Sync {
  read() {
    return sinon.spy(() => ({}))
  }

  write() {
    return sinon.spy()
  }
}
_test('sync', new Sync())

class Async {
  read() {
    return sinon.spy(() => Promise.resolve({}))
  }

  write() {
    return sinon.spy(() => Promise.resolve())
  }
}
_test('promises', new Async())

class ReadOnly {
  read() {
    return sinon.spy(() => ({}))
  }
}
_test('read-only', new ReadOnly())

class WriteOnly {
  write() {
    return sinon.spy()
  }
}
_test('write-only', new WriteOnly())

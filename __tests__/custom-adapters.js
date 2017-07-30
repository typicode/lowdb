const delay = require('delay')
const low = require('../src/main')

class Sync {
  read() {
    return this.data || {}
  }

  write(data) {
    this.data = data
  }
}

class Async {
  async read() {
    await delay(5)
    return this.data || {}
  }

  async write(data) {
    await delay(5)
    this.data = data
    return this.data
  }
}

test('should support sync adapter', () => {
  const sync = new Sync()
  const db = low(sync)
  expect(db.getState()).toEqual({})

  db.defaults({ a: 1 }).write()

  expect(db.getState()).toEqual({ a: 1 })
  expect(sync.read()).toEqual({ a: 1 })

  db.setState({ a: 2 })
  db.write()
  db.read()

  expect(db.getState()).toEqual({ a: 2 })
  expect(sync.read()).toEqual({ a: 2 })
})

test('should support async adapter', async () => {
  const async = new Async()
  const db = await low(async)
  expect(db.getState()).toEqual({})

  await db.defaults({ a: 1 }).write()

  expect(db.getState()).toEqual({ a: 1 })
  expect(await async.read()).toEqual({ a: 1 })

  db.setState({ a: 2 })
  await db.write()
  await db.read()

  expect(db.getState()).toEqual({ a: 2 })
  expect(await async.read()).toEqual({ a: 2 })
})

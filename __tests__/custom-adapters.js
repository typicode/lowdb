const sinon = require('sinon')
const low = require('../src/main')

class Sync {
  read() {
    return this.data
  }

  write(data) {
    this.data = data
  }
}

class Async {
  read() {
    return Promise.resolve(this.data)
  }

  write(data) {
    this.data = data
    return Promise.resolve()
  }
}

describe('sync and async adapter', () => {
  it('should support sync adapter', () => {
    const db = low(new Sync())
    expect(db.getState()).toBeUndefined()

    db.defaults({ a: 1 })
      .write()

    expect(db.getState()).toEqual({ a: 1 })
    expect(db.read()).toEqual({ a: 1 })

    db.setState({ a: 2 })
    db.write()

    expect(db.getState()).toEqual({ a: 2 })
    expect(db.read()).toEqual({ a: 2 })
  })

  it('should support async adapter', () => {
    const db = low(new Async())
    expect(db.getState()).toBeUndefined()

    db.defaults({ a: 1 })
      .write()

    expect(db.getState()).toEqual({ a: 1 })
    expect(db.read()).toEqual({ a: 1 })

    db.setState({ a: 2 })
    db.write()

    expect(db.getState()).toEqual({ a: 2 })
    expect(db.read()).toEqual({ a: 2 })
  })
})
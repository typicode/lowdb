const fs = require('fs')
const path = require('path')
const tempfile = require('tempfile')
const low = require('../src/main')
const Memory = require('../src/adapters/Memory')
const FileSync = require('../src/adapters/FileSync')

describe('Lowdb', () => {
  it('should support basic CRUD', () => {
    const db = low(new Memory())

    // Defaults
    db.defaults({ foo: [] }).write()

    // Create
    db
      .get('foo')
      .push({ a: 1 })
      .write()
    expect(
      db
        .get('foo')
        .size()
        .value()
    ).toBe(1)
    expect(db.getState()).toEqual({ foo: [{ a: 1 }] })

    // Read
    expect(
      db
        .get('foo')
        .find({ a: 1 })
        .value()
    ).toEqual({ a: 1 })
    expect(
      db
        .get('foo')
        .find({ b: 2 })
        .value()
    ).toBeUndefined()

    // Update
    db
      .get('foo')
      .find({ a: 1 })
      .assign({ a: 2 })
      .write()

    expect(
      !db
        .get('foo')
        .find({ a: 2 })
        .isUndefined()
        .value()
    ).toBeTruthy()

    // Delete
    db
      .get('foo')
      .remove({ a: 2 })
      .write()
    expect(db.get('foo').isEmpty()).toBeTruthy()
  })

  it('should read JSON files', () => {
    const filename = path.join(__dirname, 'fixtures/db.json')
    const db = low(new FileSync(filename))
    expect(db.getState()).toEqual({ foo: [1] })
  })

  it('should write', () => {
    const filename = tempfile()
    const db = low(new FileSync(filename))

    db.defaults({ foo: [] }).value()

    db
      .get('foo')
      .push(1)
      .write()

    const actual = JSON.parse(fs.readFileSync(filename))
    expect(actual).toEqual({ foo: [1] })
  })
})

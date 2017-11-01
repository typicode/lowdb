/* global localStorage */
const LocalStorage = require('../../src/adapters/LocalStorage')

// Mock
global.localStorage = {
  store: [],
  setItem: (key, value) => {
    localStorage.store[key] = value
  },
  getItem: key => localStorage.store[key]
}

describe('LocalStorage', () => {
  it('should read and write', () => {
    const obj = { a: 1 }

    const localStorage = new LocalStorage('db')
    expect(localStorage.read()).toEqual({})

    localStorage.write(obj)
    expect(localStorage.read()).toEqual(obj)
  })
})

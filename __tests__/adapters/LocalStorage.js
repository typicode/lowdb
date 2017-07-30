/* global localStorage */
const LocalStorage = require('../../src/adapters/LocalStorage')

// Mock
global.localStorage = {
  store: [],
  setItem: (key, value) => { localStorage.store[key] = value },
  getItem: (key) => localStorage.store[key]
}



describe('LocalStorage', () => {
  it('should read and write', () => {
    const source = 'db'
    const obj = { a: 1 }

    const localStorage = new LocalStorage()
    expect(localStorage.read(), {})

    localStorage.write(obj)
    expect(localStorage.read(), obj)
  })
})



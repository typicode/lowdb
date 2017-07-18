/* global localStorage */
const test = require('tape')
const Browser = require('../../src/adapters/browser')

// Mock
global.localStorage = {
  store: [],
  setItem: (key, value) => { localStorage.store[key] = value },
  getItem: (key) => localStorage.store[key]
}

const source = 'db'
const obj = { a: 1 }

const browser = new Browser()

test('browser', t => {
  t.same(
    browser.read(),
    {}
  )

  browser.write(obj)
  t.same(
    browser.read(),
    obj
  )

  t.end()
})



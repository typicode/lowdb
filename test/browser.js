/* global localStorage */
const test = require('tape')
const browser = require('../src/browser')

// Mock
global.localStorage = {
  store: [],
  setItem: (key, value) => localStorage.store[key] = value,
  getItem: (key) => localStorage.store[key]
}

const key = 'db'
const obj = { a: 1 }

test('browser', t => {
  browser.write(key, obj)
  t.same(browser.read(key), obj)
  t.end()
})

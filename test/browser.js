/* global localStorage */
const test = require('tape')
const browser = require('../src/browser')

// Mock
global.localStorage = {
  store: [],
  setItem: (key, value) => localStorage.store[key] = value,
  getItem: (key) => localStorage.store[key]
}

const source = 'db'
const obj = { a: 1 }

test('browser', t => {
  t.same(
    browser.read(source),
    {}
  )

  browser.write(source, obj)
  t.same(
    browser.read(source),
    obj
  )

  t.end()
})

import { deepEqual, equal } from 'node:assert/strict'
import test from 'node:test'

import { WebStorage } from './WebStorage.js'

const storage: { [key: string]: string } = {}

// Mock localStorage
const mockStorage = () => ({
  getItem: (key: string): string | null => storage[key] || null,
  setItem: (key: string, data: string) => (storage[key] = data),
  length: 1,
  removeItem() {
    return
  },
  clear() {
    return
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  key(_: number): string {
    return ''
  },
})
global.localStorage = mockStorage()
global.sessionStorage = mockStorage()

await test('localStorage', () => {
  const obj = { a: 1 }
  const storage = new WebStorage('key', localStorage)

  // Write
  equal(storage.write(obj), undefined)

  // Read
  deepEqual(storage.read(), obj)
})

await test('sessionStorage', () => {
  const obj = { a: 1 }
  const storage = new WebStorage('key', sessionStorage)

  // Write
  equal(storage.write(obj), undefined)

  // Read
  deepEqual(storage.read(), obj)
})

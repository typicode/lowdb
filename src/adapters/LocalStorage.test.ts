import test from 'ava'

import { LocalStorage } from './LocalStorage.js'

const storage: { [key: string]: string } = {}

// Mock localStorage
global.localStorage = {
  getItem: (key: string): string => storage[key],
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
}

test('should read and write', (t) => {
  const obj = { a: 1 }
  const storage = new LocalStorage('key')

  // Write
  t.is(storage.write(obj), undefined)

  // Read
  t.deepEqual(storage.read(), obj)
})

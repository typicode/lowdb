import { deepStrictEqual as deepEqual, strictEqual as equal } from 'assert'

import { LocalStorage } from './LocalStorage.js'

const storage: { [key: string]: string } = {}

// Mock localStorage
global.localStorage = {
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
}

export async function testLocalStorage() {
  const obj = { a: 1 }
  const storage = new LocalStorage('key')

  // Write
  equal(storage.write(obj), undefined)

  // Read
  deepEqual(storage.read(), obj)
}

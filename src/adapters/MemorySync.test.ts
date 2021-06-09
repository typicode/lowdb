import { deepStrictEqual as deepEqual, strictEqual as equal } from 'assert'
import { test } from 'xv'

import { MemorySync } from './MemorySync.js'

await test('should read and write', () => {
  const obj = { a: 1 }

  const memory = new MemorySync()

  // Null by default
  equal(memory.read(), null)

  // Write
  equal(memory.write(obj), undefined)

  // Read
  deepEqual(memory.read(), obj)
})

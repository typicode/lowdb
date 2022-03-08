import { deepStrictEqual as deepEqual, strictEqual as equal } from 'assert'

import { MemorySync } from './MemorySync.js'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function testMemorySync() {
  const obj = { a: 1 }

  const memory = new MemorySync()

  // Null by default
  equal(memory.read(), null)

  // Write
  equal(memory.write(obj), undefined)

  // Read
  deepEqual(memory.read(), obj)
}

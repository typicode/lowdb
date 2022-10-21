import { deepStrictEqual as deepEqual, strictEqual as equal } from 'node:assert'

import { MemorySync } from './MemorySync.js'

export function testMemorySync(): void {
  const obj = { a: 1 }

  const memory = new MemorySync()

  // Null by default
  equal(memory.read(), null)

  // Write
  equal(memory.write(obj), undefined)

  // Read
  deepEqual(memory.read(), obj)
}

import { deepStrictEqual as deepEqual, strictEqual as equal } from 'node:assert'

import { Memory, MemorySync } from './Memory.js'

export async function testMemory(): Promise<void> {
  const obj = { a: 1 }

  const memory = new Memory()

  // Null by default
  equal(await memory.read(), null)

  // Write
  equal(await memory.write(obj), undefined)

  // Read
  deepEqual(await memory.read(), obj)
}

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

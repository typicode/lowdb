import { deepStrictEqual as deepEqual, strictEqual as equal } from 'assert'

import { Memory } from './Memory.js'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function testMemory() {
  const obj = { a: 1 }

  const memory = new Memory()

  // Null by default
  equal(await memory.read(), null)

  // Write
  equal(await memory.write(obj), undefined)

  // Read
  deepEqual(await memory.read(), obj)
}

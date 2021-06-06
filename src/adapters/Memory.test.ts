import { deepEqual, equal } from 'assert/strict'
import { test } from 'xv'

import { Memory } from './Memory.js'

await test('should read and write', async () => {
  const obj = { a: 1 }

  const memory = new Memory()

  // Null by default
  equal(await memory.read(), null)

  // Write
  equal(await memory.write(obj), undefined)

  // Read
  deepEqual(await memory.read(), obj)
})

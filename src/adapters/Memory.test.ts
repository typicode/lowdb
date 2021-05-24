import test from 'ava'

import { Memory } from './Memory.js'

test('should read and write', async (t) => {
  const obj = { a: 1 }

  const memory = new Memory()

  // Null by default
  t.is(await memory.read(), null)

  // Write
  t.is(await memory.write(obj), undefined)

  // Read
  t.deepEqual(await memory.read(), obj)
})

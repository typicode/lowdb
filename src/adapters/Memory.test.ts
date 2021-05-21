import test from 'ava'

import { Memory } from './Memory.js'

test('should read and write', async (t) => {
  const obj = { a: 1 }

  const memory = new Memory()

  // Null by default
  t.is(await memory.read(), null)

  // Write obj
  t.is(await memory.write(obj), undefined)

  // Read obj
  t.deepEqual(await memory.read(), obj)
})

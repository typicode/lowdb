import test from 'ava'
import tempy from 'tempy'

import { JSONFile } from './JSONFile.js'

test('should read and write', async (t) => {
  const obj = { a: 1 }

  const filename = tempy.file()
  const file = new JSONFile(filename)

  // Null if file doesn't exist
  t.is(await file.read(), null)

  // Write obj
  t.is(await file.write(obj), undefined)

  // Read obj
  t.deepEqual(await file.read(), obj)
})

test('should preserve order', async (t) => {
  const filename = tempy.file()
  const file = new JSONFile(filename)
  const promises = []

  let i = 0
  for (; i <= 100; i++) {
    promises.push(file.write(String(i)))
  }

  await Promise.all(promises)

  t.is(await file.read(), String(i - 1))
})

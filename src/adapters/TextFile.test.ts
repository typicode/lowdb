import test from 'ava'
import tempy from 'tempy'

import { TextFile } from './TextFile.js'

test('should read and write', async (t) => {
  const str = 'foo'

  const filename = tempy.file()
  const file = new TextFile(filename)

  // Null if file doesn't exist
  t.is(await file.read(), null)

  // Write
  t.is(await file.write(str), undefined)

  // Read
  t.deepEqual(await file.read(), str)
})

test('should preserve order', async (t) => {
  const filename = tempy.file()
  const file = new TextFile(filename)
  const promises = []

  let i = 0
  for (; i <= 100; i++) {
    promises.push(file.write(String(i)))
  }

  await Promise.all(promises)

  t.is(await file.read(), String(i - 1))
})

import { deepStrictEqual as deepEqual, strictEqual as equal } from 'assert'
import tempy from 'tempy'
import { test } from 'xv'

import { TextFile } from './TextFile.js'

await test('should read and write', async () => {
  const str = 'foo'

  const filename = tempy.file()
  const file = new TextFile(filename)

  // Null if file doesn't exist
  equal(await file.read(), null)

  // Write
  equal(await file.write(str), undefined)

  // Read
  deepEqual(await file.read(), str)
})

await test('should preserve order', async () => {
  const filename = tempy.file()
  const file = new TextFile(filename)
  const promises = []

  let i = 0
  for (; i <= 100; i++) {
    promises.push(file.write(String(i)))
  }

  await Promise.all(promises)

  equal(await file.read(), String(i - 1))
})

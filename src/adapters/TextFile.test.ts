import { deepStrictEqual, strictEqual } from 'assert'
import tempy from 'tempy'
import { test } from 'xv'

import { TextFile } from './TextFile.js'

await test('should read and write', async () => {
  const str = 'foo'

  const filename = tempy.file()
  const file = new TextFile(filename)

  // Null if file doesn't exist
  strictEqual(await file.read(), null)

  // Write
  strictEqual(await file.write(str), undefined)

  // Read
  deepStrictEqual(await file.read(), str)
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

  strictEqual(await file.read(), String(i - 1))
})

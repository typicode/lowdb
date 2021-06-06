import { deepEqual, equal } from 'assert/strict'
import tempy from 'tempy'
import { test } from 'xv'

import { JSONFile } from './JSONFile.js'

await test('should read and write', async () => {
  const obj = { a: 1 }

  const filename = tempy.file()
  const file = new JSONFile(filename)

  // Null if file doesn't exist
  equal(await file.read(), null)

  // Write
  equal(await file.write(obj), undefined)

  // Read
  deepEqual(await file.read(), obj)
})

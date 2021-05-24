import test from 'ava'
import tempy from 'tempy'

import { JSONFile } from './JSONFile.js'

test('should read and write', async (t) => {
  const obj = { a: 1 }

  const filename = tempy.file()
  const file = new JSONFile(filename)

  // Null if file doesn't exist
  t.is(await file.read(), null)

  // Write
  t.is(await file.write(obj), undefined)

  // Read
  t.deepEqual(await file.read(), obj)
})

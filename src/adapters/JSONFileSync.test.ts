import { deepStrictEqual as deepEqual, strictEqual as equal } from 'assert'
import tempy from 'tempy'
import { test } from 'xv'

import { JSONFileSync } from './JSONFileSync.js'

await test('should read and write', () => {
  const obj = { a: 1 }

  const filename = tempy.file()
  const file = new JSONFileSync(filename)

  // Null if file doesn't exist
  equal(file.read(), null)

  // Write
  equal(file.write(obj), undefined)

  // Read
  deepEqual(file.read(), obj)
})

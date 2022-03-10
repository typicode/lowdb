import { deepStrictEqual as deepEqual, strictEqual as equal } from 'assert'
import tempy from 'tempy'

import { JSONFileSync } from './JSONFileSync.js'

export function testJSONFileSync(): void {
  const obj = { a: 1 }

  const filename = tempy.file()
  const file = new JSONFileSync(filename)

  // Null if file doesn't exist
  equal(file.read(), null)

  // Write
  equal(file.write(obj), undefined)

  // Read
  deepEqual(file.read(), obj)
}

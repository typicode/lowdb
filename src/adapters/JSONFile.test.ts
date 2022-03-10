import { deepStrictEqual as deepEqual, strictEqual as equal } from 'assert'
import tempy from 'tempy'

import { JSONFile } from './JSONFile.js'

export async function testJSONFile(): Promise<void> {
  const obj = { a: 1 }

  const filename = tempy.file()
  const file = new JSONFile(filename)

  // Null if file doesn't exist
  equal(await file.read(), null)

  // Write
  equal(await file.write(obj), undefined)

  // Read
  deepEqual(await file.read(), obj)
}

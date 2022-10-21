import { deepStrictEqual as deepEqual, strictEqual as equal } from 'node:assert'

import { temporaryFile } from 'tempy'

import { JSONFile } from './JSONFile.js'

export async function testJSONFile(): Promise<void> {
  const obj = { a: 1 }
  const file = new JSONFile(temporaryFile())

  // Null if file doesn't exist
  equal(await file.read(), null)

  // Write
  equal(await file.write(obj), undefined)

  // Read
  deepEqual(await file.read(), obj)
}

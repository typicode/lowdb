import { deepStrictEqual as deepEqual, strictEqual as equal } from 'node:assert'

import { temporaryFile } from 'tempy'

import { JSONFileSync } from './JSONFileSync.js'

export function testJSONFileSync(): void {
  const obj = { a: 1 }
  const file = new JSONFileSync(temporaryFile())

  // Null if file doesn't exist
  equal(file.read(), null)

  // Write
  equal(file.write(obj), undefined)

  // Read
  deepEqual(file.read(), obj)
}

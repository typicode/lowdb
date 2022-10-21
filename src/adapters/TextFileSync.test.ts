import { deepStrictEqual as deepEqual, strictEqual as equal } from 'node:assert'

import { temporaryFile } from 'tempy'

import { TextFileSync } from './TextFileSync.js'

export function testTextFileSync(): void {
  const str = 'foo'
  const file = new TextFileSync(temporaryFile())

  // Null if file doesn't exist
  equal(file.read(), null)

  // Write
  equal(file.write(str), undefined)

  // Read
  deepEqual(file.read(), str)
}

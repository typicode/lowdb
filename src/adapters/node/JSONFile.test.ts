import { deepStrictEqual as deepEqual, strictEqual as equal } from 'node:assert'

import { temporaryFile } from 'tempy'

import { JSONFile, JSONFileSync } from './JSONFile.js'

type Data = {
  a: number
}

export async function testJSONFile(): Promise<void> {
  const obj = { a: 1 }
  const file = new JSONFile<Data>(temporaryFile())

  // Null if file doesn't exist
  equal(await file.read(), null)

  // Write
  equal(await file.write(obj), undefined)

  // Read
  deepEqual(await file.read(), obj)
}

export function testJSONFileSync(): void {
  const obj = { a: 1 }
  const file = new JSONFileSync<Data>(temporaryFile())

  // Null if file doesn't exist
  equal(file.read(), null)

  // Write
  equal(file.write(obj), undefined)

  // Read
  deepEqual(file.read(), obj)
}

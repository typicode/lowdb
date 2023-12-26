import { deepEqual, equal } from 'node:assert/strict'
import test from 'node:test'

import { temporaryFile } from 'tempy'

import { JSONFile, JSONFileSync } from './JSONFile.js'

type Data = {
  a: number
}

await test('JSONFile', async () => {
  const obj = { a: 1 }
  const file = new JSONFile<Data>(temporaryFile())

  // Null if file doesn't exist
  equal(await file.read(), null)

  // Write
  equal(await file.write(obj), undefined)

  // Read
  deepEqual(await file.read(), obj)
})

await test('JSONFileSync', () => {
  const obj = { a: 1 }
  const file = new JSONFileSync<Data>(temporaryFile())

  // Null if file doesn't exist
  equal(file.read(), null)

  // Write
  equal(file.write(obj), undefined)

  // Read
  deepEqual(file.read(), obj)
})

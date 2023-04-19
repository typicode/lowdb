import { deepStrictEqual as deepEqual, strictEqual as equal } from 'node:assert'

import { temporaryFile } from 'tempy'

import { TextFile, TextFileSync } from './TextFile.js'

export async function testTextFile(): Promise<void> {
  const str = 'foo'
  const file = new TextFile(temporaryFile())

  // Null if file doesn't exist
  equal(await file.read(), null)

  // Write
  equal(await file.write(str), undefined)

  // Read
  deepEqual(await file.read(), str)
}

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

export async function testRaceCondition(): Promise<void> {
  const file = new TextFile(temporaryFile())
  const promises: Promise<void>[] = []

  let i = 0
  for (; i <= 100; i++) {
    promises.push(file.write(String(i)))
  }

  await Promise.all(promises)

  equal(await file.read(), String(i - 1))
}

import { deepStrictEqual as deepEqual, strictEqual as equal } from 'assert'
import tempy from 'tempy'

import { TextFile } from './TextFile.js'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function testTextFile() {
  const str = 'foo'

  const filename = tempy.file()
  const file = new TextFile(filename)

  // Null if file doesn't exist
  equal(await file.read(), null)

  // Write
  equal(await file.write(str), undefined)

  // Read
  deepEqual(await file.read(), str)
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function testRaceCondition() {
  const filename = tempy.file()
  const file = new TextFile(filename)
  const promises = []

  let i = 0
  for (; i <= 100; i++) {
    promises.push(file.write(String(i)))
  }

  await Promise.all(promises)

  equal(await file.read(), String(i - 1))
}

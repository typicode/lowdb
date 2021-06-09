import { deepStrictEqual as deepEqual, strictEqual as equal } from 'assert'
import tempy from 'tempy'
import { test } from 'xv'

import { TextFileSync } from './TextFileSync.js'

await test('should read and write', () => {
  const str = 'foo'

  const filename = tempy.file()
  const file = new TextFileSync(filename)

  // Null if file doesn't exist
  equal(file.read(), null)

  // Write
  equal(file.write(str), undefined)

  // Read
  deepEqual(file.read(), str)
})

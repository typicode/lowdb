import { deepStrictEqual, strictEqual } from 'assert'
import tempy from 'tempy'
import { test } from 'xv'

import { TextFileSync } from './TextFileSync.js'

await test('should read and write', () => {
  const str = 'foo'

  const filename = tempy.file()
  const file = new TextFileSync(filename)

  // Null if file doesn't exist
  strictEqual(file.read(), null)

  // Write
  strictEqual(file.write(str), undefined)

  // Read
  deepStrictEqual(file.read(), str)
})

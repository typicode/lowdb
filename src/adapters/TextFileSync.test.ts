import { deepStrictEqual as deepEqual, strictEqual as equal } from 'assert'
import tempy from 'tempy'

import { TextFileSync } from './TextFileSync.js'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/require-await
export async function testTextFileSync() {
  const str = 'foo'

  const filename = tempy.file()
  const file = new TextFileSync(filename)

  // Null if file doesn't exist
  equal(file.read(), null)

  // Write
  equal(file.write(str), undefined)

  // Read
  deepEqual(file.read(), str)
}

import test from 'ava'
import tempy from 'tempy'

import { TextFileSync } from './TextFileSync.js'

test('should read and write', (t) => {
  const str = 'foo'

  const filename = tempy.file()
  const file = new TextFileSync(filename)

  // Null if file doesn't exist
  t.is(file.read(), null)

  // Write
  t.is(file.write(str), undefined)

  // Read
  t.deepEqual(file.read(), str)
})

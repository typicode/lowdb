import test from 'ava'
import tempy from 'tempy'

import { JSONFileSync } from './JSONFileSync.js'

test('should read and write', (t) => {
  const obj = { a: 1 }

  const filename = tempy.file()
  const file = new JSONFileSync(filename)

  // Null if file doesn't exist
  t.is(file.read(), null)

  // Write obj
  t.is(file.write(obj), undefined)

  // Read obj
  t.deepEqual(file.read(), obj)
})

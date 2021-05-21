import test from 'ava'
import fs from 'fs'
import tempy from 'tempy'

import { JSONFileSync } from './adapters/JSONFileSync.js'
import { LowSync } from './LowSync.js'
import { MissingAdapterError } from './MissingAdapterError.js'

function createJSONFile(obj: unknown): string {
  const file = tempy.file()
  fs.writeFileSync(file, JSON.stringify(obj))
  return file
}

test('throws an error if no adapter is provided', (t) => {
  // Ignoring TypeScript error and pass incorrect argument
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  t.throws(() => new LowSync(), { instanceOf: MissingAdapterError })
})

test('reads and writes to JSON file', (t) => {
  type Data = {
    a?: number
    b?: number
  }

  // Create JSON file
  const obj = { a: 1 }
  const file = createJSONFile(obj)

  // Init
  const adapter = new JSONFileSync<Data>(file)
  const low = new LowSync<Data>(adapter)
  low.read()

  // Data should equal file content
  t.deepEqual(low.data, obj)

  // Write new data
  const newObj = { b: 2 }
  low.data = newObj
  low.write()

  // File content should equal new data
  const data = fs.readFileSync(file).toString()
  t.deepEqual(JSON.parse(data), newObj)
})

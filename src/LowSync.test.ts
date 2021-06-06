import { deepEqual, throws } from 'assert/strict'
import fs from 'fs'
import tempy from 'tempy'
import { test } from 'xv'

import { JSONFileSync } from './adapters/JSONFileSync.js'
import { LowSync } from './LowSync.js'
import { MissingAdapterError } from './MissingAdapterError.js'

function createJSONFile(obj: unknown): string {
  const file = tempy.file()
  fs.writeFileSync(file, JSON.stringify(obj))
  return file
}

await test('should throw an error if no adapter is provided', () => {
  // Ignoring TypeScript error and pass incorrect argument
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  throws(() => new LowSync(), MissingAdapterError)
})

await test('should read and write to JSON file', () => {
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
  deepEqual(low.data, obj)

  // Write new data
  const newObj = { b: 2 }
  low.data = newObj
  low.write()

  // File content should equal new data
  const data = fs.readFileSync(file).toString()
  deepEqual(JSON.parse(data), newObj)
})

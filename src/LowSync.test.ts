import { deepStrictEqual as deepEqual, throws } from 'node:assert'
import fs from 'node:fs'

import { temporaryFile } from 'tempy'

import { JSONFileSync } from './adapters/JSONFileSync.js'
import { LowSync } from './LowSync.js'
import { MissingAdapterError } from './MissingAdapterError.js'

function createJSONFile(obj: unknown): string {
  const file = temporaryFile()
  fs.writeFileSync(file, JSON.stringify(obj))
  return file
}

export function testNoAdapter(): void {
  // Ignoring TypeScript error and pass incorrect argument
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  throws(() => new LowSync(), MissingAdapterError)
}

export function testLowSync(): void {
  type Data = {
    a?: number
    b?: number
  }

  // Create JSON file
  const obj = { a: 1 }
  const file = createJSONFile(obj)

  // Init
  const adapter = new JSONFileSync<Data>(file)
  const low = new LowSync(adapter)
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
}

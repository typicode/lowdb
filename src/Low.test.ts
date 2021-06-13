import {
  deepStrictEqual as deepEqual,
  strictEqual as equal,
  throws,
} from 'assert'
import fs from 'fs'
import lodash from 'lodash'
import tempy from 'tempy'

import { JSONFile } from './adapters/JSONFile.js'
import { Low } from './Low.js'
import { MissingAdapterError } from './MissingAdapterError.js'

function createJSONFile(obj: unknown): string {
  const file = tempy.file()
  fs.writeFileSync(file, JSON.stringify(obj))
  return file
}

export async function testNoAdapter() {
  // Ignoring TypeScript error and pass incorrect argument
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  throws(() => new Low(), MissingAdapterError)
}

export async function testLow() {
  type Data = {
    a?: number
    b?: number
  }

  // Create JSON file
  const obj = { a: 1 }
  const file = createJSONFile(obj)

  // Init
  const adapter = new JSONFile<Data>(file)
  const low = new Low<Data>(adapter)
  await low.read()

  // Data should equal file content
  deepEqual(low.data, obj)

  // Write new data
  const newObj = { b: 2 }
  low.data = newObj
  await low.write()

  // File content should equal new data
  const data = fs.readFileSync(file).toString()
  deepEqual(JSON.parse(data), newObj)
}

export async function testLodash() {
  // Extend with lodash
  class LowWithLodash extends Low<typeof obj> {
    chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data')
  }

  // Create JSON file
  const obj = { todos: ['foo', 'bar'] }
  const file = createJSONFile(obj)

  // Init
  const adapter = new JSONFile<typeof obj>(file)
  const low = new LowWithLodash(adapter)
  await low.read()

  // Use lodash
  const firstTodo = low.chain.get('todos').first().value()

  equal(firstTodo, 'foo')
}

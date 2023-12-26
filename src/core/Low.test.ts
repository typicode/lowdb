/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  deepStrictEqual as deepEqual,
  strictEqual as equal,
  throws,
} from 'node:assert'
import fs from 'node:fs'

import lodash from 'lodash'
import { temporaryFile } from 'tempy'

import { Memory } from '../adapters/Memory.js'
import { JSONFile, JSONFileSync } from '../adapters/node/JSONFile.js'
import { Low, LowSync } from './Low.js'

type Data = {
  a?: number
  b?: number
}

function createJSONFile(obj: unknown): string {
  const file = temporaryFile()
  fs.writeFileSync(file, JSON.stringify(obj))
  return file
}

function readJSONFile(file: string): unknown {
  return JSON.parse(fs.readFileSync(file).toString())
}

export function testCheckArgs(): void {
  const adapter = new Memory()
  // Ignoring TypeScript error and pass incorrect argument
  // @ts-ignore
  throws(() => new Low())
  // @ts-ignore
  throws(() => new LowSync())
  // @ts-ignore
  throws(() => new Low(adapter))
  // @ts-ignore
  throws(() => new LowSync(adapter))
}

export async function testLow(): Promise<void> {
  // Create JSON file
  const obj = { a: 1 }
  const file = createJSONFile(obj)

  // Init
  const defaultData: Data = {}
  const adapter = new JSONFile<Data>(file)
  const low = new Low(adapter, defaultData)
  await low.read()

  // Data should equal file content
  deepEqual(low.data, obj)

  // Write new data
  const newObj = { b: 2 }
  low.data = newObj
  await low.write()

  // File content should equal new data
  deepEqual(readJSONFile(file), newObj)

  // Write using update()
  await low.update((data) => {
    data.b = 3
  })
  deepEqual(readJSONFile(file), { b: 3 })
}

export function testLowSync(): void {
  // Create JSON file
  const obj = { a: 1 }
  const file = createJSONFile(obj)

  // Init
  const defaultData: Data = {}
  const adapter = new JSONFileSync<Data>(file)
  const low = new LowSync(adapter, defaultData)
  low.read()

  // Data should equal file content
  deepEqual(low.data, obj)

  // Write new data
  const newObj = { b: 2 }
  low.data = newObj
  low.write()

  // File content should equal new data
  deepEqual(readJSONFile(file), newObj)

  // Write using update()
  low.update((data) => {
    data.b = 3
  })
  deepEqual(readJSONFile(file), { b: 3 })
}

export async function testLodash(): Promise<void> {
  // Extend with lodash
  class LowWithLodash<T> extends Low<T> {
    chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data')
  }

  // Create JSON file
  const obj = { todos: ['foo', 'bar'] }
  const file = createJSONFile(obj)

  // Init
  const defaultData = { todos: [] }
  const adapter = new JSONFile<typeof obj>(file)
  const low = new LowWithLodash(adapter, defaultData)
  await low.read()

  // Use lodash
  const firstTodo = low.chain.get('todos').first().value()

  equal(firstTodo, 'foo')
}

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { deepEqual, equal, throws } from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

import lodash from 'lodash'
import { temporaryFile } from 'tempy'

import { Memory, MemorySync } from '../adapters/Memory.js'
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

await test('CheckArgs', () => {
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
})

await test('Low', async () => {
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
})

await test('LowSync', () => {
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
})

await test('Lodash', async () => {
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
})

await test('Low does not mutate or share the defaultData object', async () => {
  const defaultData = { name: 'ALICE', nested: { x: 1 } }
  const low = new Low(new Memory<typeof defaultData>(), defaultData)
  await low.read()

  low.data.name = 'BOB'
  low.data.nested.x = 99

  // The object passed as defaultData must stay untouched (issue #604)
  deepEqual(defaultData, { name: 'ALICE', nested: { x: 1 } })

  // A second instance created from the same defaultData sees the defaults
  const other = new Low(new Memory<typeof defaultData>(), defaultData)
  await other.read()
  deepEqual(other.data, { name: 'ALICE', nested: { x: 1 } })
})

await test('LowSync does not mutate or share the defaultData object', () => {
  const defaultData = { name: 'ALICE', nested: { x: 1 } }
  const low = new LowSync(new MemorySync<typeof defaultData>(), defaultData)
  low.read()

  low.data.name = 'BOB'
  low.data.nested.x = 99

  deepEqual(defaultData, { name: 'ALICE', nested: { x: 1 } })

  const other = new LowSync(new MemorySync<typeof defaultData>(), defaultData)
  other.read()
  deepEqual(other.data, { name: 'ALICE', nested: { x: 1 } })
})

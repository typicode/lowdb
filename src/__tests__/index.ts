import * as fs from 'fs'
import * as lodash from 'lodash'
import * as tempy from 'tempy'
import JSONFileAdapter from '../adapters/JSONFile'
import Low from '../Low'

function createJSONFile(obj) {
  const file = tempy.file()
  fs.writeFileSync(file, JSON.stringify(obj))
  return file
}

describe('Low', () => {
  test('throws an error if no adapter is provided', () => {
    // @ts-ignore
    expect(() => new Low()).toThrowError(/adapter/i)
  })

  test('reads and writes to JSON file', async () => {
    // Create JSON file
    const obj = { a: 1 }
    const file = createJSONFile(obj)

    // Init
    const adapter = new JSONFileAdapter(file)
    const low = new Low(adapter)
    await low.read()

    // Data should equal file content
    expect(low.data).toEqual(obj)

    // Write new data
    const newObj = { b: 2 }
    low.data = newObj
    await low.write()

    // File content should equal new data
    const data = fs.readFileSync(file).toString()
    expect(JSON.parse(data)).toEqual(newObj)
  })

  test('works with lodash', async () => {
    // Extend with lodash
    class LowWithLodash extends Low {
      public chain = lodash.chain(this).get('data')
    }

    // Create JSON file
    const obj = { todos: ['foo', 'bar'] }
    const file = createJSONFile(obj)

    // Init
    const adapter = new JSONFileAdapter(file)
    const low = new LowWithLodash(adapter)
    await low.read()

    // Use lodash
    const firstTodo = low.chain
      .get('todos')
      .first()
      .value()

    expect(firstTodo).toBe('foo')
  })
})

import fs from 'fs'
import tempy from 'tempy'

import { JSONFileSync } from './adapters/JSONFileSync'
import { LowSync } from './LowSync'

function createJSONFile(obj: unknown): string {
  const file = tempy.file()
  fs.writeFileSync(file, JSON.stringify(obj))
  return file
}

describe('LowSync', () => {
  test('throws an error if no adapter is provided', () => {
    // Ignoring TypeScript error and pass incorrect argument
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => new LowSync()).toThrowError(/adapter/i)
  })

  test('reads and writes to JSON file', () => {
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
    expect(low.data).toEqual(obj)

    // Write new data
    const newObj = { b: 2 }
    low.data = newObj
    low.write()

    // File content should equal new data
    const data = fs.readFileSync(file).toString()
    expect(JSON.parse(data)).toEqual(newObj)
  })
})

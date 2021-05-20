import tempy from 'tempy'

import { JSONFile } from './JSONFile'

describe('JSONFile', () => {
  it('should read and write', async () => {
    const obj = { a: 1 }

    const filename = tempy.file()
    const file = new JSONFile(filename)

    // Null if file doesn't exist
    expect(await file.read()).toBeNull()

    // Write obj
    expect(await file.write(obj)).toBeUndefined()

    // Read obj
    expect(await file.read()).toEqual(obj)
  })

  it('should preserve order', async () => {
    const filename = tempy.file()
    const file = new JSONFile(filename)
    const promises = []

    let i = 0
    for (; i <= 100; i++) {
      promises.push(file.write(String(i)))
    }

    await Promise.all(promises)

    expect(await file.read()).toEqual(String(i - 1))
  })
})

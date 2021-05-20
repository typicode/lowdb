import tempy from 'tempy'

import { JSONFileSync } from './JSONFileSync'

describe('JSONFileSync', () => {
  it('should read and write', () => {
    const obj = { a: 1 }

    const filename = tempy.file()
    const file = new JSONFileSync(filename)

    // Null if file doesn't exist
    expect(file.read()).toBeNull()

    // Write obj
    expect(file.write(obj)).toBeUndefined()

    // Read obj
    expect(file.read()).toEqual(obj)
  })
})

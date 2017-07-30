const sinon = require('sinon')
const tempfile = require('tempfile')
const FileSync = require('../../src/adapters/FileSync')
const FileAsync = require('../../src/adapters/FileAsync')

const obj = { a: 1 }

describe('FileSync', () => {
  it('should read and write', () => {
    const file = new FileSync(tempfile())

    expect(file.read()).toEqual({})

    file.write(obj)
    expect(file.read()).toEqual(obj)
  })

  it('should support options', () => {
    const serialize = sinon.spy(JSON.stringify)
    const deserialize = sinon.spy(JSON.parse)

    const file = new FileSync(tempfile(), { serialize, deserialize })

    file.read() // The first time, an empty file is created and deserialize doesn't need to called
    file.read() // to ensure, deserialize is called, we call file.read() a second time
    file.write(obj)

    expect(serialize.calledWith(obj)).toBeTruthy()
    expect(deserialize.calledOnce).toBeTruthy()
  })
})

describe('FileAsync', () => {
  it('should read and write', async () => {
    const file = new FileAsync(tempfile())

    expect(await file.read()).toEqual({})

    await file.write(obj)
    expect(await file.read()).toEqual(obj)
  })

  it('should support options', async () => {
    const serialize = sinon.spy(JSON.stringify)
    const deserialize = sinon.spy(JSON.parse)

    const file = new FileAsync(tempfile(), { serialize, deserialize })

    await file.read() // The first time, an empty file is created and deserialize doesn't need to called
    await file.read() // to ensure, deserialize is called, we call file.read() a second time
    await file.write(obj)

    expect(serialize.calledWith(obj)).toBeTruthy()
    expect(deserialize.calledOnce).toBeTruthy()
  })
})

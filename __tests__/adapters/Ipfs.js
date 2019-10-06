const IPFSAdapter = require('../../src/adapters/Ipfs')
const IPFS = require('ipfs')
const path = require('path')
const os = require('os')
const hat = require('hat')
const crypto = require('crypto')
const obj = { a: 1, _parentHash: null }
const password = 'mySecretTest'
const salt = 'MySalt'
const keyLength = 24

describe('simple test', () => {
  it('should read and write', async () => {
    const node = await IPFS.create()
    const ipfs = new IPFSAdapter(node)
    expect(ipfs.read()).toEqual({})
    await ipfs.write(obj)
    const result = await ipfs.read()
    expect(result).toEqual(obj)
  })

  it('should read and write with key', async () => {
    const node = await IPFS.create({
      repo: path.join(os.tmpdir(), 'ipfs-repo-' + hat()),
      init: { bits: 512 },
      config: {
        Addresses: {
          Swarm: []
        }
      },
      preload: { enabled: false }
    })
    const key = crypto.scryptSync(password, salt, keyLength)
    const ipfs = new IPFSAdapter(node, null, key)
    expect(ipfs.read()).toEqual({})
    await ipfs.write(obj)
    const result = await ipfs.read()
    expect(result).toEqual(obj)
  })
})

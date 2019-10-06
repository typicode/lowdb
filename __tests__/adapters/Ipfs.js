const IPFSAdapter = require('../../src/adapters/Ipfs')
const IPFS = require('ipfs')
const obj = { a: 1, _parentHash: null }
const path = require('path')
const os = require('os')
const hat = require('hat')

describe('simple test', () => {
  it('should read and write', async () => {
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
    const ipfs = new IPFSAdapter(node)
    expect(ipfs.read()).toEqual({})
    await ipfs.write(obj)
    const result = await ipfs.read()
    expect(result).toEqual(obj)
  })
})
